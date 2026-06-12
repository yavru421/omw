using System.Net.Http.Json;
using OMW.Models;

namespace OMW.Services;

public class OsrmRoutingService : IRoutingService
{
    private readonly HttpClient _http;
    
    public OsrmRoutingService(HttpClient http)
    {
        _http = http;
    }

    public async Task<int> GetDriveTimeMinutesAsync(double startLat, double startLng, double endLat, double endLng)
    {
        try 
        {
            // OSRM requires coordinates in Longitude,Latitude format
            string url = $"https://router.project-osrm.org/route/v1/driving/{startLng},{startLat};{endLng},{endLat}?overview=false";
            var result = await _http.GetFromJsonAsync<OsrmResponse>(url);
            
            if (result?.Code == "Ok" && result.Routes.Count > 0)
            {
                return (int)Math.Ceiling(result.Routes[0].Duration / 60.0);
            }
            return 0;
        }
        catch 
        {
            return 0; // Graceful fallback if routing API fails
        }
    }
}
