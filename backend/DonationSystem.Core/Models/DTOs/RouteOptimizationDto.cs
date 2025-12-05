namespace DonationSystem.Core.Models.DTOs
{
    public class RouteRequestDto
    {
        public int StartOfficerId { get; set; }
        public List<int> ReceiverIds { get; set; } = new List<int>();
        public RouteConstraintsDto Constraints { get; set; } = new RouteConstraintsDto();
    }

    public class RouteConstraintsDto
    {
        public double MaxDistance { get; set; } = 100;
        public int MaxStops { get; set; } = 10;
        public bool AvoidHighways { get; set; } = false;
    }

    public class RouteResponseDto
    {
        public List<RoutePointDto> Path { get; set; } = new List<RoutePointDto>();
        public double TotalDistance { get; set; }
        public double EstimatedTime { get; set; }
        public double FuelCost { get; set; }
        public List<string> Directions { get; set; } = new List<string>();
    }

    public class RoutePointDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Type { get; set; } = string.Empty; // "Officer" or "Receiver"
    }
}