"""
Database layer for device persistence.

Supports multiple backends:
- SQLite (default for development)
- PostgreSQL (production)
- Supabase (easiest production setup)
"""

import os
import json
from typing import Optional, Dict
from datetime import datetime


# Abstract base class for database operations
class DeviceStore:
    """Base class for device storage"""

    async def register_device(self, device_id: str, public_key: str,
                             car_model: Optional[str] = None,
                             nickname: Optional[str] = None) -> Dict:
        raise NotImplementedError

    async def get_device_by_id(self, device_id: str) -> Optional[Dict]:
        raise NotImplementedError

    async def get_device_by_pubkey(self, public_key: str) -> Optional[Dict]:
        raise NotImplementedError


# SQLite Implementation (Default for Development)
class SQLiteDeviceStore(DeviceStore):
    """SQLite backend for development"""

    def __init__(self, db_path: str = "looma_devices.db"):
        import sqlite3
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        import sqlite3
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS devices (
                device_id TEXT PRIMARY KEY,
                public_key TEXT UNIQUE NOT NULL,
                car_model TEXT,
                nickname TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()

    async def register_device(self, device_id: str, public_key: str,
                             car_model: Optional[str] = None,
                             nickname: Optional[str] = None) -> Dict:
        import sqlite3
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        try:
            cursor.execute('''
                INSERT INTO devices (device_id, public_key, car_model, nickname)
                VALUES (?, ?, ?, ?)
            ''', (device_id, public_key, car_model, nickname))
            conn.commit()
        except sqlite3.IntegrityError:
            # Device already exists, return existing
            pass
        finally:
            conn.close()

        return await self.get_device_by_pubkey(public_key)

    async def get_device_by_id(self, device_id: str) -> Optional[Dict]:
        import sqlite3
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT device_id, public_key, car_model, nickname
            FROM devices WHERE device_id = ?
        ''', (device_id,))
        row = cursor.fetchone()
        conn.close()

        if row:
            return {
                "device_id": row[0],
                "public_key": row[1],
                "car_model": row[2],
                "nickname": row[3]
            }
        return None

    async def get_device_by_pubkey(self, public_key: str) -> Optional[Dict]:
        import sqlite3
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT device_id, public_key, car_model, nickname
            FROM devices WHERE public_key = ?
        ''', (public_key,))
        row = cursor.fetchone()
        conn.close()

        if row:
            return {
                "device_id": row[0],
                "public_key": row[1],
                "car_model": row[2],
                "nickname": row[3]
            }
        return None


# PostgreSQL Implementation (Production)
class PostgreSQLDeviceStore(DeviceStore):
    """PostgreSQL backend for production"""

    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self._init_db()

    def _init_db(self):
        import psycopg2
        conn = psycopg2.connect(self.connection_string)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS devices (
                device_id TEXT PRIMARY KEY,
                public_key TEXT UNIQUE NOT NULL,
                car_model TEXT,
                nickname TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()

    async def register_device(self, device_id: str, public_key: str,
                             car_model: Optional[str] = None,
                             nickname: Optional[str] = None) -> Dict:
        import psycopg2
        conn = psycopg2.connect(self.connection_string)
        cursor = conn.cursor()

        try:
            cursor.execute('''
                INSERT INTO devices (device_id, public_key, car_model, nickname)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (public_key) DO NOTHING
            ''', (device_id, public_key, car_model, nickname))
            conn.commit()
        finally:
            conn.close()

        return await self.get_device_by_pubkey(public_key)

    async def get_device_by_id(self, device_id: str) -> Optional[Dict]:
        import psycopg2
        conn = psycopg2.connect(self.connection_string)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT device_id, public_key, car_model, nickname
            FROM devices WHERE device_id = %s
        ''', (device_id,))
        row = cursor.fetchone()
        conn.close()

        if row:
            return {
                "device_id": row[0],
                "public_key": row[1],
                "car_model": row[2],
                "nickname": row[3]
            }
        return None

    async def get_device_by_pubkey(self, public_key: str) -> Optional[Dict]:
        import psycopg2
        conn = psycopg2.connect(self.connection_string)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT device_id, public_key, car_model, nickname
            FROM devices WHERE public_key = %s
        ''', (public_key,))
        row = cursor.fetchone()
        conn.close()

        if row:
            return {
                "device_id": row[0],
                "public_key": row[1],
                "car_model": row[2],
                "nickname": row[3]
            }
        return None


# Supabase Implementation (Easiest Production)
class SupabaseDeviceStore(DeviceStore):
    """Supabase backend for easy production deployment"""

    def __init__(self, url: str, key: str):
        from supabase import create_client
        self.client = create_client(url, key)
        self.table = "devices"

    async def register_device(self, device_id: str, public_key: str,
                             car_model: Optional[str] = None,
                             nickname: Optional[str] = None) -> Dict:
        # Check if device exists
        existing = await self.get_device_by_pubkey(public_key)
        if existing:
            return existing

        # Insert new device
        data = {
            "device_id": device_id,
            "public_key": public_key,
            "car_model": car_model,
            "nickname": nickname
        }

        result = self.client.table(self.table).insert(data).execute()
        return result.data[0] if result.data else data

    async def get_device_by_id(self, device_id: str) -> Optional[Dict]:
        result = self.client.table(self.table).select("*").eq("device_id", device_id).execute()
        return result.data[0] if result.data else None

    async def get_device_by_pubkey(self, public_key: str) -> Optional[Dict]:
        result = self.client.table(self.table).select("*").eq("public_key", public_key).execute()
        return result.data[0] if result.data else None


# In-Memory Implementation (Fallback)
class InMemoryDeviceStore(DeviceStore):
    """In-memory storage for testing or fallback"""

    def __init__(self):
        self.devices_by_id = {}
        self.devices_by_pubkey = {}

    async def register_device(self, device_id: str, public_key: str,
                             car_model: Optional[str] = None,
                             nickname: Optional[str] = None) -> Dict:
        device = {
            "device_id": device_id,
            "public_key": public_key,
            "car_model": car_model,
            "nickname": nickname
        }

        self.devices_by_id[device_id] = device
        self.devices_by_pubkey[public_key] = device
        return device

    async def get_device_by_id(self, device_id: str) -> Optional[Dict]:
        return self.devices_by_id.get(device_id)

    async def get_device_by_pubkey(self, public_key: str) -> Optional[Dict]:
        return self.devices_by_pubkey.get(public_key)


# Factory function to create appropriate store
def create_device_store() -> DeviceStore:
    """
    Create device store based on environment configuration.

    Environment variables:
    - DATABASE_TYPE: sqlite | postgresql | supabase | memory (default: sqlite)
    - DATABASE_URL: Connection string for postgresql
    - SUPABASE_URL: Supabase project URL
    - SUPABASE_KEY: Supabase anon key
    - SQLITE_PATH: Path to SQLite database (default: looma_devices.db)
    """
    db_type = os.getenv("DATABASE_TYPE", "sqlite").lower()

    if db_type == "postgresql":
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            print("⚠️  DATABASE_URL not set, falling back to SQLite")
            return SQLiteDeviceStore()
        try:
            return PostgreSQLDeviceStore(db_url)
        except Exception as e:
            print(f"⚠️  PostgreSQL connection failed: {e}, falling back to SQLite")
            return SQLiteDeviceStore()

    elif db_type == "supabase":
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        if not supabase_url or not supabase_key:
            print("⚠️  Supabase credentials not set, falling back to SQLite")
            return SQLiteDeviceStore()
        try:
            return SupabaseDeviceStore(supabase_url, supabase_key)
        except Exception as e:
            print(f"⚠️  Supabase connection failed: {e}, falling back to SQLite")
            return SQLiteDeviceStore()

    elif db_type == "memory":
        print("⚠️  Using in-memory storage (data will be lost on restart)")
        return InMemoryDeviceStore()

    else:  # sqlite (default)
        sqlite_path = os.getenv("SQLITE_PATH", "looma_devices.db")
        return SQLiteDeviceStore(sqlite_path)
