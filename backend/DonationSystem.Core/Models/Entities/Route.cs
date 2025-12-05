using System.ComponentModel.DataAnnotations;

namespace DonationSystem.Core.Models.Entities
{
    public class Route
    {
        [Key]
        public int RouteId { get; set; }
        
        [Required]
        public int DistributionId { get; set; }
        
        [Required]
        public int FromOfficerId { get; set; }
        
        [Required]
        public int ToReceiverId { get; set; }
        
        public decimal Distance { get; set; } // in kilometers
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public Distribution Distribution { get; set; } = null!;
        public Officer FromOfficer { get; set; } = null!;
        public Receiver ToReceiver { get; set; } = null!;
    }
}