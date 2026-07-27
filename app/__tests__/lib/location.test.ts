import { getLocation } from '@/app/lib/location';

describe('Location Library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get current position with GPS coordinates', async () => {
    const mockPosition = {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        speed: 25.5,
        heading: 90,
      },
    };

    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success) => success(mockPosition)
    );

    const location = await getLocation();

    expect(location).toEqual({
      lat: 37.7749,
      lng: -122.4194,
      speed: 25.5,
      heading: 90,
    });

    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: true }
    );
  });

  it('should default speed and heading to 0 if null', async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        speed: null,
        heading: null,
      },
    };

    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success) => success(mockPosition)
    );

    const location = await getLocation();

    expect(location).toEqual({
      lat: 40.7128,
      lng: -74.0060,
      speed: 0,
      heading: 0,
    });
  });

  it('should reject if geolocation is not supported', async () => {
    const originalGeolocation = navigator.geolocation;
    // @ts-ignore
    delete navigator.geolocation;

    await expect(getLocation()).rejects.toBe('Geolocation not supported');

    // Restore
    navigator.geolocation = originalGeolocation;
  });

  it('should reject on position error', async () => {
    const mockError = {
      code: 1,
      message: 'User denied geolocation',
    };

    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success, error) => error(mockError)
    );

    await expect(getLocation()).rejects.toEqual(mockError);
  });

  it('should use high accuracy mode', async () => {
    const mockPosition = {
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
        speed: 0,
        heading: 0,
      },
    };

    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success) => success(mockPosition)
    );

    await getLocation();

    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: true }
    );
  });
});
