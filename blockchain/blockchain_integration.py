"""
Blockchain Integration for Looma.sh V2V Platform
Secure data sharing, smart contracts, and decentralized verification
"""

import json
import hashlib
import time
import asyncio
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import cryptography
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import base64

class BlockchainNetwork(Enum):
    ETHEREUM = "ethereum"
    POLYGON = "polygon"
    ARBITRUM = "arbitrum"
    OPTIMISM = "optimism"
    LOOMA_PRIVATE = "looma_private"

class DataCategory(Enum):
    V2V_MESSAGES = "v2v_messages"
    VEHICLE_TELEMETRY = "vehicle_telemetry"
    TRAFFIC_DATA = "traffic_data"
    SAFETY_EVENTS = "safety_events"
    USER_PRIVACY = "user_privacy"

@dataclass
class BlockchainData:
    data_hash: str
    category: DataCategory
    timestamp: int
    device_id: str
    signature: str
    metadata: Dict
    proof: str = None

@dataclass
class SmartContractCall:
    contract_address: str
    function_name: str
    parameters: Dict
    value: int = 0  # Wei amount
    gas_limit: int = 1000000

class BlockchainManager:
    """Manages blockchain operations for Looma.sh platform"""

    def __init__(self, network: BlockchainNetwork = BlockchainNetwork.LOOMA_PRIVATE):
        self.network = network
        self.private_key = None
        self.public_key = None
        self.address = None
        self.contract_addresses = {}
        self.pending_transactions = {}
        self.data_cache = {}
        self.block_height = 0

    async def initialize(self, private_key_hex: Optional[str] = None) -> Dict:
        """Initialize blockchain connection and generate key pair if needed"""
        try:
            if private_key_hex:
                # Load existing private key
                private_key_bytes = bytes.fromhex(private_key_hex)
                self.private_key = ed25519.Ed25519PrivateKey.from_private_bytes(private_key_bytes)
            else:
                # Generate new key pair
                self.private_key = ed25519.Ed25519PrivateKey.generate()

            self.public_key = self.private_key.public_key()
            self.address = self.get_address_from_public_key()

            # Initialize contract addresses based on network
            await self._load_contract_addresses()

            # Get current block height
            self.block_height = await self._get_current_block_height()

            return {
                "address": self.address,
                "network": self.network.value,
                "block_height": self.block_height,
                "initialized": True
            }
        except Exception as e:
            raise Exception(f"Failed to initialize blockchain: {str(e)}")

    async def store_data_on_blockchain(self,
                                     data: Any,
                                     category: DataCategory,
                                     device_id: str,
                                     metadata: Dict = None) -> BlockchainData:
        """Store data hash on blockchain for immutability and verification"""
        try:
            # Serialize and hash the data
            data_serialized = json.dumps(data, sort_keys=True, default=str)
            data_hash = hashlib.sha256(data_serialized.encode()).hexdigest()

            # Create blockchain data object
            blockchain_data = BlockchainData(
                data_hash=data_hash,
                category=category,
                timestamp=int(time.time()),
                device_id=device_id,
                signature="",  # Will be filled after signing
                metadata=metadata or {}
            )

            # Sign the data
            signature_data = self._create_signature_data(blockchain_data)
            signature = self._sign_data(signature_data)
            blockchain_data.signature = signature

            # Store on blockchain
            tx_hash = await self._store_hash_on_chain(blockchain_data)

            # Generate proof of storage
            proof = await self._generate_storage_proof(tx_hash)
            blockchain_data.proof = proof

            # Cache the data
            self.data_cache[data_hash] = {
                "original_data": data,
                "blockchain_data": blockchain_data,
                "tx_hash": tx_hash,
                "cached_at": int(time.time())
            }

            return blockchain_data

        except Exception as e:
            raise Exception(f"Failed to store data on blockchain: {str(e)}")

    async def verify_data_integrity(self,
                                  data_hash: str,
                                  original_data: Any = None) -> Dict:
        """Verify data integrity using blockchain records"""
        try:
            # Get blockchain record
            blockchain_record = await self._get_blockchain_record(data_hash)
            if not blockchain_record:
                return {"verified": False, "reason": "Data not found on blockchain"}

            # Verify signature
            signature_valid = await self._verify_signature(blockchain_record)
            if not signature_valid:
                return {"verified": False, "reason": "Invalid signature"}

            # Verify data hash if original data provided
            if original_data:
                data_serialized = json.dumps(original_data, sort_keys=True, default=str)
                computed_hash = hashlib.sha256(data_serialized.encode()).hexdigest()
                if computed_hash != data_hash:
                    return {"verified": False, "reason": "Data hash mismatch"}

            return {
                "verified": True,
                "blockchain_record": blockchain_record,
                "verification_time": int(time.time())
            }

        except Exception as e:
            return {"verified": False, "reason": f"Verification error: {str(e)}"}

    async def create_smart_contract_call(self,
                                       contract_name: str,
                                       function_name: str,
                                       parameters: Dict,
                                       value: int = 0) -> str:
        """Execute a smart contract function"""
        try:
            contract_address = self.contract_addresses.get(contract_name)
            if not contract_address:
                raise Exception(f"Contract {contract_name} not found")

            call = SmartContractCall(
                contract_address=contract_address,
                function_name=function_name,
                parameters=parameters,
                value=value
            )

            # Execute the contract call
            tx_hash = await self._execute_contract_call(call)

            # Add to pending transactions
            self.pending_transactions[tx_hash] = {
                "call": call,
                "submitted_at": int(time.time()),
                "status": "pending"
            }

            return tx_hash

        except Exception as e:
            raise Exception(f"Smart contract call failed: {str(e)}")

    async def get_transaction_status(self, tx_hash: str) -> Dict:
        """Get status of a blockchain transaction"""
        try:
            if tx_hash in self.pending_transactions:
                tx_info = self.pending_transactions[tx_hash]

                # Check if transaction is confirmed
                receipt = await self._get_transaction_receipt(tx_hash)
                if receipt:
                    tx_info["status"] = "confirmed"
                    tx_info["block_number"] = receipt.get("blockNumber")
                    tx_info["gas_used"] = receipt.get("gasUsed")
                    tx_info["confirmed_at"] = int(time.time())
                else:
                    # Still pending
                    tx_info["status"] = "pending"

                return tx_info
            else:
                # Check blockchain directly
                receipt = await self._get_transaction_receipt(tx_hash)
                if receipt:
                    return {
                        "status": "confirmed",
                        "block_number": receipt.get("blockNumber"),
                        "gas_used": receipt.get("gasUsed"),
                        "confirmed_at": int(time.time())
                    }
                else:
                    return {
                        "status": "unknown",
                        "reason": "Transaction not found"
                    }

        except Exception as e:
            return {
                "status": "error",
                "reason": f"Status check failed: {str(e)}"
            }

    async def get_blockchain_analytics(self) -> Dict:
        """Get analytics about blockchain usage and performance"""
        try:
            total_transactions = await self._get_total_transactions()
            active_contracts = len(self.contract_addresses)
            current_block = await self._get_current_block_height()
            data_records = len(self.data_cache)
            pending_tx = len([tx for tx in self.pending_transactions.values() if tx["status"] == "pending"])

            return {
                "network": self.network.value,
                "current_block": current_block,
                "total_transactions": total_transactions,
                "active_contracts": active_contracts,
                "cached_data_records": data_records,
                "pending_transactions": pending_tx,
                "analytics_time": int(time.time())
            }

        except Exception as e:
            return {
                "error": f"Failed to get analytics: {str(e)}",
                "analytics_time": int(time.time())
            }

    async def create_data_sharing_agreement(self,
                                           participant_address: str,
                                           data_categories: List[DataCategory],
                                           duration_hours: int = 24,
                                           terms: Dict = None) -> str:
        """Create a smart contract for data sharing agreement"""
        try:
            agreement_params = {
                "participant": participant_address,
                "categories": [cat.value for cat in data_categories],
                "duration": duration_hours * 3600,  # Convert to seconds
                "terms": terms or {},
                "created_at": int(time.time()),
                "creator": self.address
            }

            tx_hash = await self.create_smart_contract_call(
                "DataSharingAgreement",
                "createAgreement",
                agreement_params
            )

            return tx_hash

        except Exception as e:
            raise Exception(f"Failed to create data sharing agreement: {str(e)}")

    async def revoke_data_access(self, agreement_id: str, reason: str = None) -> str:
        """Revoke data access under a sharing agreement"""
        try:
            params = {
                "agreementId": agreement_id,
                "reason": reason or "Access revoked by owner",
                "revoked_at": int(time.time()),
                "revoker": self.address
            }

            tx_hash = await self.create_smart_contract_call(
                "DataSharingAgreement",
                "revokeAccess",
                params
            )

            return tx_hash

        except Exception as e:
            raise Exception(f"Failed to revoke data access: {str(e)}")

    # Private helper methods

    def get_address_from_public_key(self) -> str:
        """Generate blockchain address from public key"""
        public_bytes = self.public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )
        # Take first 20 bytes of Keccak256 hash
        hash_obj = hashes.Hash(hashes.SHA256())
        hash_obj.update(public_bytes)
        address_bytes = hash_obj.finalize()[:20]
        return "0x" + address_bytes.hex()

    def _create_signature_data(self, blockchain_data: BlockchainData) -> bytes:
        """Create data to be signed"""
        data_dict = {
            "data_hash": blockchain_data.data_hash,
            "category": blockchain_data.category.value,
            "timestamp": blockchain_data.timestamp,
            "device_id": blockchain_data.device_id,
            "metadata": blockchain_data.metadata
        }
        data_string = json.dumps(data_dict, sort_keys=True, separators=(',', ':'))
        return data_string.encode('utf-8')

    def _sign_data(self, data: bytes) -> str:
        """Sign data with private key"""
        signature = self.private_key.sign(data)
        return base64.b64encode(signature).decode('utf-8')

    async def _verify_signature(self, blockchain_data: BlockchainData) -> bool:
        """Verify the signature of blockchain data"""
        try:
            signature_data = self._create_signature_data(blockchain_data)
            signature_bytes = base64.b64decode(blockchain_data.signature)

            self.public_key.verify(signature_bytes, signature_data)
            return True
        except Exception:
            return False

    async def _load_contract_addresses(self):
        """Load smart contract addresses for the current network"""
        # In a real implementation, this would load from config or registry
        self.contract_addresses = {
            "DataRegistry": "0x1234567890123456789012345678901234567890",
            "DataSharingAgreement": "0x2345678901234567890123456789012345678901",
            "AccessControl": "0x3456789012345678901234567890123456789012"
        }

    async def _get_current_block_height(self) -> int:
        """Get current blockchain block height"""
        # In a real implementation, this would query the blockchain
        return int(time.time()) // 15  # Simulate block height

    async def _store_hash_on_chain(self, blockchain_data: BlockchainData) -> str:
        """Store data hash on blockchain"""
        # In a real implementation, this would create a blockchain transaction
        data_dict = asdict(blockchain_data)
        tx_hash = hashlib.sha256(json.dumps(data_dict, sort_keys=True).encode()).hexdigest()
        return "0x" + tx_hash[:64]  # Simulate transaction hash

    async def _generate_storage_proof(self, tx_hash: str) -> str:
        """Generate proof of data storage"""
        # In a real implementation, this would generate Merkle proof
        proof_data = f"storage_proof_{tx_hash}_{int(time.time())}"
        return hashlib.sha256(proof_data.encode()).hexdigest()

    async def _get_blockchain_record(self, data_hash: str) -> Optional[Dict]:
        """Get blockchain record for data hash"""
        # In a real implementation, this would query the blockchain
        if data_hash in self.data_cache:
            return asdict(self.data_cache[data_hash]["blockchain_data"])
        return None

    async def _execute_contract_call(self, call: SmartContractCall) -> str:
        """Execute smart contract call"""
        # In a real implementation, this would execute the contract
        call_data = json.dumps({
            "contract": call.contract_address,
            "function": call.function_name,
            "params": call.parameters,
            "value": call.value
        }, sort_keys=True)

        tx_hash = hashlib.sha256(call_data.encode()).hexdigest()
        return "0x" + tx_hash[:64]

    async def _get_transaction_receipt(self, tx_hash: str) -> Optional[Dict]:
        """Get transaction receipt"""
        # In a real implementation, this would query the blockchain
        # Simulate confirmation after some time
        if tx_hash in self.pending_transactions:
            tx_info = self.pending_transactions[tx_hash]
            if int(time.time()) - tx_info["submitted_at"] > 30:  # Confirm after 30 seconds
                return {
                    "blockNumber": self.block_height + 1,
                    "gasUsed": "21000",
                    "status": "0x1"
                }
        return None

    async def _get_total_transactions(self) -> int:
        """Get total number of transactions on blockchain"""
        # In a real implementation, this would query the blockchain
        return len(self.data_cache) + len(self.pending_transactions)

# Global blockchain manager instance
blockchain_manager = BlockchainManager()

async def initialize_blockchain(private_key: Optional[str] = None) -> Dict:
    """Initialize blockchain system"""
    return await blockchain_manager.initialize(private_key)

async def secure_data_storage(data: Any,
                             category: DataCategory,
                             device_id: str,
                             metadata: Dict = None) -> BlockchainData:
    """Store data securely on blockchain"""
    return await blockchain_manager.store_data_on_blockchain(
        data, category, device_id, metadata
    )

async def verify_data_integrity(data_hash: str,
                               original_data: Any = None) -> Dict:
    """Verify data integrity using blockchain"""
    return await blockchain_manager.verify_data_integrity(data_hash, original_data)