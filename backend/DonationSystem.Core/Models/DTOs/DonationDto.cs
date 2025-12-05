using System.Text.Json.Serialization;

namespace DonationSystem.Core.Models.DTOs
{
    public class DonationDto
    {
        public int DonationId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public int OfficerId { get; set; }
        public int DonorId { get; set; }
        public DateTime DonatedDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        
        // Additional info
        public string OfficerName { get; set; } = string.Empty;
        public string DonorName { get; set; } = string.Empty;
    }

    public class CreateDonationDto
    {
        [JsonPropertyName("itemName")]
        public string ItemName { get; set; } = string.Empty;
        
        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }
        
        [JsonPropertyName("officerId")]
        public int OfficerId { get; set; }
        
        [JsonPropertyName("donorId")]
        public int? DonorId { get; set; }  // Optional if creating new donor
        
        [JsonPropertyName("donatedDate")]
        public DateTime DonatedDate { get; set; } = DateTime.UtcNow;
        
        [JsonPropertyName("expiryDate")]
        public DateTime? ExpiryDate { get; set; }
        
        // New donor info - used when creating a new donor inline
        [JsonPropertyName("newDonor")]
        public NewDonorInfo? NewDonor { get; set; }
    }

    public class NewDonorInfo
    {
        [JsonPropertyName("nicNumber")]
        public string NICNumber { get; set; } = string.Empty;
        
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
        
        [JsonPropertyName("phoneNumber")]
        public string PhoneNumber { get; set; } = string.Empty;
        
        [JsonPropertyName("address")]
        public string Address { get; set; } = string.Empty;
    }

    public class UpdateDonationDto
    {
        [JsonPropertyName("itemName")]
        public string ItemName { get; set; } = string.Empty;
        
        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }
        
        [JsonPropertyName("expiryDate")]
        public DateTime? ExpiryDate { get; set; }
    }
}