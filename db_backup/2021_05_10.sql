/*
SQLyog Ultimate v10.00 Beta1
MySQL - 5.5.5-10.1.32-MariaDB : Database - vms
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`vms` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `vms`;

/*Table structure for table `cameras` */

DROP TABLE IF EXISTS `cameras`;

CREATE TABLE `cameras` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `camera_name` varchar(25) DEFAULT NULL COMMENT 'camera name',
  `camera_url` varchar(255) DEFAULT NULL COMMENT 'camera source url',
  `server_url` varchar(255) DEFAULT NULL COMMENT 'camera processing and storage video url',
  `state` int(11) DEFAULT '1' COMMENT 'turn on or off',
  `location` varchar(200) DEFAULT NULL COMMENT 'camera location',
  `user_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

/*Data for the table `cameras` */

/*Table structure for table `link_roles_menus` */

DROP TABLE IF EXISTS `link_roles_menus`;

CREATE TABLE `link_roles_menus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `roles_id` int(11) NOT NULL,
  `menus_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `menus_id` (`menus_id`),
  KEY `roles_id` (`roles_id`),
  CONSTRAINT `link_roles_menus_ibfk_1` FOREIGN KEY (`menus_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `link_roles_menus_ibfk_2` FOREIGN KEY (`roles_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8;

/*Data for the table `link_roles_menus` */

insert  into `link_roles_menus`(`id`,`roles_id`,`menus_id`) values (28,6,1),(66,2,1),(68,2,3),(69,2,6),(70,2,7),(73,2,5),(103,1,1),(104,1,3),(105,1,6),(106,1,7),(109,1,5);

/*Table structure for table `menus` */

DROP TABLE IF EXISTS `menus`;

CREATE TABLE `menus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `icon` varchar(50) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `parent_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

/*Data for the table `menus` */

insert  into `menus`(`id`,`name`,`icon`,`url`,`parent_id`) values (1,'Dashboard','fa fa-dashboard','/Manager/Index',0),(3,'Roles','fa fa-universal-access','/Roles/Index',0),(5,'User Management','fa fa-users','/User/Index',0),(6,'Camera','fa fa-camera','/Camera/Index',0),(7,'Videos','fa fa-video-camera','/Video/Index',0);

/*Table structure for table `notifications` */

DROP TABLE IF EXISTS `notifications`;

CREATE TABLE `notifications` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(20) DEFAULT NULL,
  `content` varchar(200) DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `checked` int(1) DEFAULT '0',
  `user_email` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `notifications` */

/*Table structure for table `roles` */

DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

/*Data for the table `roles` */

insert  into `roles`(`id`,`title`,`description`) values (1,'Manager','Super Admin with all rights...'),(2,'Supervisor2222','Can View Dashboard, Admins & Roles'),(3,'dsd','df'),(6,'Developer','Can View Dashboard &  Admins List');

/*Table structure for table `tbl_admin` */

DROP TABLE IF EXISTS `tbl_admin`;

CREATE TABLE `tbl_admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `register_date` datetime DEFAULT NULL,
  `icon_path` varchar(255) DEFAULT NULL,
  `role_id` int(11) DEFAULT '2',
  PRIMARY KEY (`id`),
  KEY `admins_ibfk_1` (`role_id`),
  CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8;

/*Data for the table `tbl_admin` */

insert  into `tbl_admin`(`id`,`name`,`email`,`password`,`register_date`,`icon_path`,`role_id`) values (1,'Pang','pang@gmail.com','123456','2020-07-08 16:55:41',NULL,2),(2,'Aman','aman@gmail.com','123456','2020-09-04 16:59:17','',1);

/*Table structure for table `videos` */

DROP TABLE IF EXISTS `videos`;

CREATE TABLE `videos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `video_filename` varchar(255) DEFAULT NULL COMMENT 'video file name',
  `camera_id` int(11) DEFAULT NULL COMMENT 'camera id',
  `thumb_name` varchar(255) DEFAULT NULL COMMENT 'thumb nail image file name',
  `start_time` datetime DEFAULT NULL COMMENT 'video recording begin time',
  `end_time` datetime DEFAULT NULL COMMENT 'video recording endtime',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

/*Data for the table `videos` */

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
