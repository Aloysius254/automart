CREATE TABLE `cars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`make` varchar(64) NOT NULL,
	`model` varchar(64) NOT NULL,
	`year` int NOT NULL,
	`trim` varchar(64),
	`color` varchar(64),
	`mileage` int NOT NULL DEFAULT 0,
	`price` decimal(12,2) NOT NULL,
	`condition` enum('new','used','certified') NOT NULL DEFAULT 'used',
	`transmission` enum('automatic','manual','cvt') DEFAULT 'automatic',
	`fuelType` enum('petrol','diesel','electric','hybrid') DEFAULT 'petrol',
	`bodyType` enum('sedan','suv','hatchback','coupe','truck','van','convertible','wagon') DEFAULT 'sedan',
	`engineSize` varchar(32),
	`doors` int DEFAULT 4,
	`seats` int DEFAULT 5,
	`vin` varchar(17),
	`description` text,
	`features` text,
	`status` enum('available','sold','reserved','draft') NOT NULL DEFAULT 'available',
	`featured` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cartId` int NOT NULL,
	`partId` int,
	`carId` int,
	`quantity` int NOT NULL DEFAULT 1,
	`priceAtAdd` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`partId` int,
	`carId` int,
	`productName` varchar(255) NOT NULL,
	`productSku` varchar(64),
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	`subtotal` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderNumber` varchar(32) NOT NULL,
	`status` enum('pending','confirmed','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`subtotal` decimal(12,2) NOT NULL,
	`tax` decimal(10,2) NOT NULL DEFAULT '0',
	`shipping` decimal(10,2) NOT NULL DEFAULT '0',
	`total` decimal(12,2) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(32),
	`shippingAddress` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`carId` int,
	`partId` int,
	`url` text NOT NULL,
	`altText` varchar(255),
	`isPrimary` boolean DEFAULT false,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `spare_parts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`sku` varchar(64) NOT NULL,
	`category` enum('engine','brakes','suspension','electrical','body','interior','exhaust','transmission','cooling','fuel','filters','lighting','tyres','accessories','other') NOT NULL DEFAULT 'other',
	`brand` varchar(64),
	`price` decimal(10,2) NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`lowStockThreshold` int DEFAULT 5,
	`compatibleMakes` text,
	`compatibleModels` text,
	`compatibleYears` text,
	`description` text,
	`weight` decimal(8,2),
	`dimensions` varchar(64),
	`warranty` varchar(64),
	`featured` boolean DEFAULT false,
	`active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `spare_parts_id` PRIMARY KEY(`id`),
	CONSTRAINT `spare_parts_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;