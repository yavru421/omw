namespace OMW.Models;

public class GpsCoordinates
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double Accuracy { get; set; }
}

public class OsrmResponse
{
    public string Code { get; set; }
    public List<OsrmRoute> Routes { get; set; } = new();
}

public class OsrmRoute
{
    public double Duration { get; set; }
}
