using System.ComponentModel.DataAnnotations;

namespace DonationSystem.Core.Models.Entities
{
    public class Distribution
    {
        [Key]
        public int DistributionId { get; set; }
        
        public int? DonationId { get; set; }
        
        [Required]
        public int OfficerId { get; set; }
        
        [Required]
        public int ReceiverId { get; set; }
        
        [MaxLength(100)]
        public string ItemName { get; set; } = string.Empty;
        
        public int? ItemId { get; set; }
        
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
        
        public DateTime GivenDate { get; set; } = DateTime.UtcNow;
        
        [MaxLength(500)]
        public string? Complaint { get; set; }
        
        // Navigation properties
        public Donation? Donation { get; set; }
        public Officer Officer { get; set; }
        public Receiver Receiver { get; set; }
        public Item? Item { get; set; }
        public ICollection<Route> Routes { get; set; } = new List<Route>();
    }
}