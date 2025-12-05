-- Populate Donation Management System Database with Sri Lankan Data
-- Connect to database: \c DonationSystemDB

-- Clear existing data to avoid foreign key issues
DELETE FROM "Routes";
DELETE FROM "Distributions";
DELETE FROM "Donations";
DELETE FROM "Items";
DELETE FROM "Receivers";
DELETE FROM "Donors";
DELETE FROM "Officers";

-- Reset sequences to start from 1
ALTER SEQUENCE "Officers_OfficerId_seq" RESTART WITH 1;
ALTER SEQUENCE "Donors_DonorId_seq" RESTART WITH 1;
ALTER SEQUENCE "Receivers_ReceiverId_seq" RESTART WITH 1;
ALTER SEQUENCE "Donations_DonationId_seq" RESTART WITH 1;
ALTER SEQUENCE "Distributions_DistributionId_seq" RESTART WITH 1;
ALTER SEQUENCE "Items_ItemId_seq" RESTART WITH 1;
ALTER SEQUENCE "Routes_RouteId_seq" RESTART WITH 1;

-- Insert Officers across Sri Lanka
INSERT INTO "Officers" ("Name", "Post", "OfficeName", "Address", "PhoneNumber", "NICNumber", "Latitude", "Longitude", "CreatedAt") VALUES
('Kasun Perera', 'Distribution Manager', 'Colombo Central Office', 'No. 45, Galle Road, Colombo 03', '+94771234567', '199012345678', 6.9271, 79.8612, CURRENT_TIMESTAMP),
('Nimali Fernando', 'Logistics Coordinator', 'Kandy Regional Office', '123, Peradeniya Road, Kandy', '+94772345678', '198523456789', 7.2906, 80.6337, CURRENT_TIMESTAMP),
('Ranil Silva', 'Warehouse Manager', 'Galle Distribution Center', '78, Matara Road, Galle', '+94773456789', '198734567890', 6.0535, 80.2210, CURRENT_TIMESTAMP),
('Sanduni Wickramasinghe', 'Field Officer', 'Jaffna Regional Office', '234, Hospital Road, Jaffna', '+94774567890', '199245678901', 9.6615, 80.0255, CURRENT_TIMESTAMP),
('Chaminda Bandara', 'Distribution Officer', 'Kurunegala Office', '56, Dambulla Road, Kurunegala', '+94775678901', '198856789012', 7.4818, 80.3619, CURRENT_TIMESTAMP),
('Thilini Rajapaksa', 'Area Coordinator', 'Anuradhapura Office', '89, Main Street, Anuradhapura', '+94776789012', '199067890123', 8.3114, 80.4037, CURRENT_TIMESTAMP),
('Mahesh Jayawardena', 'Operations Manager', 'Ratnapura Office', '45, Colombo Road, Ratnapura', '+94777890123', '198778901234', 6.7056, 80.3847, CURRENT_TIMESTAMP),
('Dilini Kumari', 'Relief Coordinator', 'Batticaloa Office', '123, Bar Road, Batticaloa', '+94778901234', '199189012345', 7.7310, 81.6747, CURRENT_TIMESTAMP);

-- Insert Donors across Sri Lanka
INSERT INTO "Donors" ("NICNumber", "Name", "PhoneNumber", "Address", "CreatedAt") VALUES
('198512345678', 'Dharmasena Traders', '+94112345678', 'No. 234, Union Place, Colombo 02', CURRENT_TIMESTAMP),
('199023456789', 'Sampath Enterprises', '+94812345678', 'No. 45, Dalada Veediya, Kandy', CURRENT_TIMESTAMP),
('198734567890', 'Chandrika Stores', '+94912345678', 'No. 67, Main Street, Galle', CURRENT_TIMESTAMP),
('199145678901', 'Northern Suppliers', '+94212345678', 'No. 123, Stanley Road, Jaffna', CURRENT_TIMESTAMP),
('198856789012', 'Kurunegala Traders', '+94372345678', 'No. 89, Negombo Road, Kurunegala', CURRENT_TIMESTAMP),
('199267890123', 'Rajarata Enterprises', '+94252345678', 'No. 156, Maithripala Road, Anuradhapura', CURRENT_TIMESTAMP),
('198978901234', 'Gem City Stores', '+94452345678', 'No. 78, Ratnapura Road, Embilipitiya', CURRENT_TIMESTAMP),
('199389012345', 'Eastern Traders', '+94652345678', 'No. 234, Main Street, Batticaloa', CURRENT_TIMESTAMP),
('199090123456', 'Negombo Fisheries', '+94312345678', 'No. 45, Sea Street, Negombo', CURRENT_TIMESTAMP),
('198801234567', 'Matara Suppliers', '+94412345678', 'No. 123, Beach Road, Matara', CURRENT_TIMESTAMP),
('199112345678', 'Trincomalee Traders', '+94262345678', 'No. 67, Fort Street, Trincomalee', CURRENT_TIMESTAMP),
('199223456789', 'Nuwara Eliya Estates', '+94522345678', 'No. 234, Bazaar Street, Nuwara Eliya', CURRENT_TIMESTAMP),
('198834567890', 'Chilaw Merchants', '+94322345678', 'No. 89, Main Road, Chilaw', CURRENT_TIMESTAMP),
('199345678901', 'Hambantota Supplies', '+94472345678', 'No. 156, Port Access Road, Hambantota', CURRENT_TIMESTAMP),
('198945678901', 'Vavuniya Traders', '+94242345678', 'No. 78, Second Cross Street, Vavuniya', CURRENT_TIMESTAMP);

-- Insert Receivers (beneficiaries) across Sri Lanka with GPS coordinates
INSERT INTO "Receivers" ("Name", "Address", "Latitude", "Longitude", "Priority", "CreatedAt") VALUES
-- Colombo area
('Colombo Slum Community Center', 'No. 12, Baseline Road, Colombo 09', 6.9344, 79.8428, 1, CURRENT_TIMESTAMP),
('Wanathamulla Community', 'No. 45, Moor Road, Colombo 06', 6.9488, 79.8742, 2, CURRENT_TIMESTAMP),
('Slave Island Relief Center', 'No. 78, Union Place, Colombo 02', 6.9271, 79.8612, 1, CURRENT_TIMESTAMP),

-- Kandy area  
('Kandy Urban Poor Relief Center', 'No. 23, Bogambara Road, Kandy', 7.2855, 80.6404, 2, CURRENT_TIMESTAMP),
('Peradeniya Village Center', 'No. 56, Peradeniya Road, Kandy', 7.2653, 80.5975, 1, CURRENT_TIMESTAMP),

-- Northern Province
('Jaffna Displaced Persons Camp', 'No. 34, Point Pedro Road, Jaffna', 9.6739, 80.0191, 3, CURRENT_TIMESTAMP),
('Kilinochchi Resettlement Area', 'No. 67, A9 Road, Kilinochchi', 9.3961, 80.3840, 3, CURRENT_TIMESTAMP),
('Vavuniya Community Center', 'No. 89, Hospital Road, Vavuniya', 8.7514, 80.4971, 2, CURRENT_TIMESTAMP),
('Mannar Coastal Community', 'No. 12, Jetty Road, Mannar', 8.9810, 79.9044, 3, CURRENT_TIMESTAMP),

-- Eastern Province
('Batticaloa Refugee Center', 'No. 45, Trinco Road, Batticaloa', 7.7172, 81.6924, 3, CURRENT_TIMESTAMP),
('Trincomalee Tamil Community', 'No. 78, Fort Frederick Road, Trincomalee', 8.5874, 81.2152, 2, CURRENT_TIMESTAMP),
('Ampara Development Society', 'No. 23, Main Street, Ampara', 7.2976, 81.6731, 2, CURRENT_TIMESTAMP),

-- Southern Province
('Galle Rural Development Society', 'No. 56, Matara Road, Galle', 6.0367, 80.2170, 1, CURRENT_TIMESTAMP),
('Matara Coastal Village', 'No. 89, Beach Road, Matara', 5.9549, 80.5550, 2, CURRENT_TIMESTAMP),
('Hambantota Fishermen Village', 'No. 12, Harbour Road, Hambantota', 6.1429, 81.1212, 2, CURRENT_TIMESTAMP),

-- Central areas
('Kurunegala Village Development', 'No. 45, Kandy Road, Kurunegala', 7.4867, 80.3647, 1, CURRENT_TIMESTAMP),
('Anuradhapura Rural Community', 'No. 78, Sacred City Road, Anuradhapura', 8.3355, 80.4111, 2, CURRENT_TIMESTAMP),
('Polonnaruwa Rural Welfare', 'No. 23, Ancient City Road, Polonnaruwa', 7.9403, 81.0188, 1, CURRENT_TIMESTAMP),
('Ratnapura Estate Workers', 'No. 56, Gem Road, Ratnapura', 6.6828, 80.3990, 2, CURRENT_TIMESTAMP),
('Kegalle Mountain Communities', 'No. 89, Kandy Road, Kegalle', 7.2513, 80.3464, 1, CURRENT_TIMESTAMP),

-- Hill Country
('Nuwara Eliya Estate Laborers', 'No. 12, Bazaar Street, Nuwara Eliya', 6.9497, 80.7891, 3, CURRENT_TIMESTAMP),
('Badulla Uva Community', 'No. 45, Passara Road, Badulla', 6.9934, 81.0550, 2, CURRENT_TIMESTAMP),

-- Western coastal areas
('Negombo Fishermen Cooperative', 'No. 78, Lewis Place, Negombo', 7.2084, 79.8358, 1, CURRENT_TIMESTAMP),
('Chilaw Community Center', 'No. 23, Beach Road, Chilaw', 7.5759, 79.7953, 1, CURRENT_TIMESTAMP),
('Kalutara Social Welfare', 'No. 56, Galle Road, Kalutara', 6.5854, 79.9607, 2, CURRENT_TIMESTAMP),
('Puttalam Lagoon Fishermen', 'No. 89, Mundel Road, Puttalam', 8.0362, 79.8283, 2, CURRENT_TIMESTAMP);

-- Insert sample Donations
INSERT INTO "Donations" ("ItemName", "Quantity", "OfficerId", "DonorId", "DonatedDate", "ExpiryDate") VALUES
-- Recent donations with expiry dates
('Rice (5kg bags)', 500, 1, 1, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '6 months'),
('Dhal (1kg packets)', 300, 1, 2, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 year'),
('Sugar (1kg)', 200, 2, 3, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '1 year'),
('Tea (500g)', 250, 2, 4, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '2 years'),
('Milk Powder (400g)', 180, 3, 5, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '18 months'),
('Dried Fish (500g)', 150, 3, 6, CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '6 months'),
('Coconut Oil (1L)', 120, 4, 7, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '1 year'),
('Wheat Flour (1kg)', 400, 4, 8, CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE + INTERVAL '8 months'),
('Canned Fish', 350, 5, 9, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '2 years'),
('Biscuits (200g)', 600, 5, 10, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '6 months'),
('Soap Bars', 400, 6, 11, CURRENT_DATE - INTERVAL '2 days', NULL),
('Toothpaste', 300, 6, 12, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '2 years'),
('Sanitary Items', 250, 7, 13, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 years'),
('Blankets', 100, 7, 14, CURRENT_DATE - INTERVAL '7 days', NULL),
('Mosquito Nets', 150, 8, 15, CURRENT_DATE - INTERVAL '3 days', NULL),
('Water Bottles (1L)', 800, 1, 1, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 year'),
('Instant Noodles', 500, 2, 2, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '6 months'),
('Cooking Salt (500g)', 300, 3, 3, CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '5 years'),
('Chili Powder (100g)', 200, 4, 4, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '1 year'),
('Curry Powder (100g)', 250, 5, 5, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '1 year');

-- Insert sample Distributions
INSERT INTO "Distributions" ("OfficerId", "ReceiverId", "ItemName", "Quantity", "GivenDate", "Complaint") VALUES
-- Recent distributions to various areas
(1, 1, 'Rice (5kg bags)', 50, CURRENT_DATE - INTERVAL '1 day', 'Urgent relief needed'),
(1, 2, 'Dhal (1kg packets)', 30, CURRENT_DATE - INTERVAL '2 days', 'Flood affected families'),
(2, 4, 'Sugar (1kg)', 25, CURRENT_DATE - INTERVAL '1 day', NULL),
(3, 13, 'Coconut Oil (1L)', 20, CURRENT_DATE - INTERVAL '3 days', 'Coastal area support'),
(4, 6, 'Milk Powder (400g)', 30, CURRENT_DATE - INTERVAL '2 days', 'Resettlement program'),
(4, 10, 'Canned Fish', 40, CURRENT_DATE - INTERVAL '1 day', 'Refugee assistance'),
(5, 16, 'Biscuits (200g)', 60, CURRENT_DATE - INTERVAL '4 days', NULL),
(6, 17, 'Rice (5kg bags)', 45, CURRENT_DATE - INTERVAL '2 days', 'Rural development'),
(7, 19, 'Tea (500g)', 25, CURRENT_DATE - INTERVAL '3 days', 'Estate workers welfare'),
(8, 10, 'Wheat Flour (1kg)', 35, CURRENT_DATE - INTERVAL '1 day', 'Additional relief'),
(1, 14, 'Dried Fish (500g)', 20, CURRENT_DATE - INTERVAL '5 days', NULL),
(2, 11, 'Dhal (1kg packets)', 28, CURRENT_DATE - INTERVAL '2 days', 'Tamil community support'),
(3, 23, 'Coconut Oil (1L)', 18, CURRENT_DATE - INTERVAL '3 days', 'Fishermen relief'),
(5, 21, 'Soap Bars', 40, CURRENT_DATE - INTERVAL '1 day', NULL),
(6, 20, 'Milk Powder (400g)', 25, CURRENT_DATE - INTERVAL '4 days', 'Mountain communities');

-- Display summary
SELECT 'Officers inserted: ' || COUNT(*) as summary FROM "Officers";
SELECT 'Donors inserted: ' || COUNT(*) as summary FROM "Donors";
SELECT 'Receivers inserted: ' || COUNT(*) as summary FROM "Receivers";
SELECT 'Donations inserted: ' || COUNT(*) as summary FROM "Donations";
SELECT 'Distributions inserted: ' || COUNT(*) as summary FROM "Distributions";

-- Display sample data
SELECT 'OFFICERS:' as section;
SELECT "OfficerId", "Name", "OfficeName", "Address" FROM "Officers" ORDER BY "OfficerId";

SELECT 'RECEIVERS WITH LOCATIONS:' as section;
SELECT "ReceiverId", "Name", "Latitude", "Longitude"
FROM "Receivers" ORDER BY "ReceiverId";
