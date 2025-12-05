namespace DonationSystem.Core.Models.DTOs
{
    public class ReceiverDto
    {
        public int ReceiverId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public string Address { get; set; } = string.Empty;
        public int Priority { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateReceiverDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public string Address { get; set; } = string.Empty;
        public int Priority { get; set; } = 1;
    }

    public class UpdateReceiverDto
    {
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public int Priority { get; set; }
    }
}
