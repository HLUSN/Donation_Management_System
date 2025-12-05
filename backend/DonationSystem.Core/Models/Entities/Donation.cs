using System.ComponentModel.DataAnnotations;

namespace DonationSystem.Core.Models.Entities
{
    public class Donation
    {
        [Key]
        public int DonationId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string ItemName { get; set; } = string.Empty;
        
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
        
        [Required]
        public int OfficerId { get; set; }
        
        [Required]
        public int DonorId { get; set; }
        
        public DateTime DonatedDate { get; set; } = DateTime.UtcNow;
        
        public DateTime? ExpiryDate { get; set; }
        
        // Navigation properties
        public Officer Officer { get; set; } = null!;
        public Donor Donor { get; set; } = null!;
        public ICollection<Item> Items { get; set; } = new List<Item>();
        public ICollection<Distribution> Distributions { get; set; } = new List<Distribution>();
    }
}