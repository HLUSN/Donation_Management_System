using System.ComponentModel.DataAnnotations;

namespace DonationSystem.Core.Models.Entities
{
    public class Donor
    {
        [Key]
        public int DonorId { get; set; }
        
        [Required]
        [MaxLength(12)]
        public string NICNumber { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(15)]
        public string PhoneNumber { get; set; } = string.Empty;
        
        public string Address { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<Donation> Donations { get; set; } = new List<Donation>();
        public ICollection<Item> Items { get; set; } = new List<Item>();
    }
}