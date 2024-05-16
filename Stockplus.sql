-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema Stockplus
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema Stockplus
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `Stockplus` ;
USE `Stockplus` ;

-- -----------------------------------------------------
-- Table `Stockplus`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Stockplus`.`users` (
  `userId` INT NOT NULL AUTO_INCREMENT,
  `firstName` VARCHAR(45) NOT NULL,
  `lastName` VARCHAR(45) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phoneNumber` INT NOT NULL,
  `role` VARCHAR(45) NOT NULL DEFAULT 'user',
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Stockplus`.`orders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Stockplus`.`orders` (
  `orderId` INT NOT NULL,
  `orderDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `amount` INT NOT NULL,
  `userId` INT NOT NULL,
  PRIMARY KEY (`orderId`),
  INDEX `fk_orders_users1_idx` (`userId` ASC) VISIBLE,
  CONSTRAINT `fk_orders_users1`
    FOREIGN KEY (`userId`)
    REFERENCES `Stockplus`.`users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Stockplus`.`payments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Stockplus`.`payments` (
  `paymentId` INT NOT NULL AUTO_INCREMENT,
  `paymentDate` TIMESTAMP NOT NULL,
  `amount` INT NOT NULL,
  `paymentMethod` VARCHAR(45) NOT NULL,
  `orderId` INT NOT NULL,
  PRIMARY KEY (`paymentId`),
  INDEX `fk_payments_orders1_idx` (`orderId` ASC) VISIBLE,
  CONSTRAINT `fk_payments_orders1`
    FOREIGN KEY (`orderId`)
    REFERENCES `Stockplus`.`orders` (`orderId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Stockplus`.`suppliers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Stockplus`.`suppliers` (
  `supplierId` INT NOT NULL AUTO_INCREMENT,
  `supplierName` VARCHAR(45) NOT NULL,
  `contactPerson` VARCHAR(45) NULL,
  `contactNumber` INT NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `Address` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`supplierId`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Stockplus`.`category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Stockplus`.`category` (
  `categoryId` INT NOT NULL AUTO_INCREMENT,
  `categoryName` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`categoryId`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Stockplus`.`product`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Stockplus`.`product` (
  `productId` INT NOT NULL AUTO_INCREMENT,
  `productName` VARCHAR(45) NOT NULL,
  `productDescription` VARCHAR(255) NOT NULL,
  `productPrice` INT NOT NULL,
  `stocklevel` INT NOT NULL,
  `supplierId` INT NOT NULL,
  `categoryId` INT NOT NULL,
  PRIMARY KEY (`productId`),
  INDEX `fk_product_suppliers_idx` (`supplierId` ASC) VISIBLE,
  INDEX `fk_product_category1_idx` (`categoryId` ASC) VISIBLE,
  CONSTRAINT `fk_product_suppliers`
    FOREIGN KEY (`supplierId`)
    REFERENCES `Stockplus`.`suppliers` (`supplierId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_product_category1`
    FOREIGN KEY (`categoryId`)
    REFERENCES `Stockplus`.`category` (`categoryId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Stockplus`.`orderDetails`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Stockplus`.`orderDetails` (
  `orderDetailsId` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` INT NOT NULL,
  `orderId` INT NOT NULL,
  `productId` INT NOT NULL,
  PRIMARY KEY (`orderDetailsId`),
  INDEX `fk_orderItems_orders1_idx` (`orderId` ASC) VISIBLE,
  INDEX `fk_orderItems_product1_idx` (`productId` ASC) VISIBLE,
  CONSTRAINT `fk_orderItems_orders1`
    FOREIGN KEY (`orderId`)
    REFERENCES `Stockplus`.`orders` (`orderId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_orderItems_product1`
    FOREIGN KEY (`productId`)
    REFERENCES `Stockplus`.`product` (`productId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
