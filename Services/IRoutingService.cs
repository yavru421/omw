namespace OMW.Services;

public interface IRoutingService
{
    Task<int> GetDriveTimeMinutesAsync(double startLat, double startLng, double endLat, double endLng);
}
