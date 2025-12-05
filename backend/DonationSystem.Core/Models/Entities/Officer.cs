using System.ComponentModel.DataAnnotations;

namespace DonationSystem.Core.Models.Entities
{
    public class Officer
    {
        [Key]
        public int OfficerId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string Post { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string OfficeName { get; set; } = string.Empty;
        
        public string Address { get; set; } = string.Empty;
        
        [MaxLength(15)]
        public string PhoneNumber { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(12)]
        public string NICNumber { get; set; } = string.Empty;
        
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<Donation> Donations { get; set; } = new List<Donation>();
        public ICollection<Distribution> Distributions { get; set; } = new List<Distribution>();
    }
}