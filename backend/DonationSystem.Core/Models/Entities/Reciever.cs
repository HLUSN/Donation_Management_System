using System.ComponentModel.DataAnnotations;

namespace DonationSystem.Core.Models.Entities
{
    public class Receiver
    {
        [Key]
        public int ReceiverId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        
        public string Address { get; set; } = string.Empty;
        
        [Range(1, 5)]
        public int Priority { get; set; } = 1;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<Item> Items { get; set; } = new List<Item>();
        public ICollection<Distribution> Distributions { get; set; } = new List<Distribution>();
    }
}