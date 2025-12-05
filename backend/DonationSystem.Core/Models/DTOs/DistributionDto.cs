namespace DonationSystem.Core.Models.DTOs
{
    public class DistributionDto
    {
        public int DistributionId { get; set; }
        public int? DonationId { get; set; }
        public int OfficerId { get; set; }
        public int ReceiverId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int? ItemId { get; set; }
        public int Quantity { get; set; }
        public DateTime GivenDate { get; set; }
        public string? Complaint { get; set; }
        
        // Additional info
        public string OfficerName { get; set; } = string.Empty;
        public string ReceiverName { get; set; } = string.Empty;
        public string? ItemNameFromItem { get; set; }
    }

    public class CreateDistributionDto
    {
        public int? DonationId { get; set; }
        public int OfficerId { get; set; }
        public int ReceiverId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int? ItemId { get; set; }
        public int Quantity { get; set; }
        public DateTime GivenDate { get; set; } = DateTime.UtcNow;
        public string? Complaint { get; set; }
    }

    public class UpdateDistributionDto
    {
        public string ItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? Complaint { get; set; }
    }
}
