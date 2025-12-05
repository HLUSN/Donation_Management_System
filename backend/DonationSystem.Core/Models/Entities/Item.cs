using System.ComponentModel.DataAnnotations;

namespace DonationSystem.Core.Models.Entities
{
    public class Item
    {
        [Key]
        public int ItemId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string ItemName { get; set; } = string.Empty;
        
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
        
        public DateTime? ExpiryDate { get; set; }
        
        public int? DonorId { get; set; }
        public int? ReceiverId { get; set; }
        public int? DonationId { get; set; }
        
        // Navigation properties
        public Donor? Donor { get; set; }
        public Receiver? Receiver { get; set; }
        public Donation? Donation { get; set; }
    }
}