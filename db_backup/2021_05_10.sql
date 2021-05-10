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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8;

/*Data for the table `cameras` */

insert  into `cameras`(`id`,`camera_name`,`camera_url`,`server_url`,`state`,`location`,`user_id`) values (2,'stef','rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov','AS',1,'Pari',1),(5,'Camera 3','D:\\stream_server\\test.mp4','HQGZL',0,'wer',1),(11,'container1','H:\\fff\\20190314-LPR-brazil\\container\\engine\\Videos Forte\\Video_1 (1).mp4',NULL,1,'container1',1),(12,'container2','H:\\fff\\20190314-LPR-brazil\\container\\engine\\Videos Forte\\Video_1 (2).mp4',NULL,1,'container2',1),(13,'container3','H:\\fff\\20190314-LPR-brazil\\container\\engine\\Videos Forte\\Video_1 (3).mp4',NULL,1,'container3',1),(14,'container4','H:\\fff\\20190314-LPR-brazil\\container\\engine\\Videos Forte\\Video_1 (4).mp4',NULL,1,'container4',1),(15,'container5','H:\\fff\\20190314-LPR-brazil\\container\\engine\\Videos Forte\\Video_1 (5).mp4',NULL,1,'container5',1),(16,'container6','H:\\fff\\20190314-LPR-brazil\\container\\engine\\Videos Forte\\Video_1 (6).mp4',NULL,1,'container6',1),(17,'container7','H:\\fff\\20190314-LPR-brazil\\container\\engine\\Videos Forte\\Video_1 (7).mp4',NULL,1,'container7',1),(18,'container8','H:\\fff\\20190314-LPR-brazil\\container\\engine\\Videos Forte\\Video_1 (8).mp4',NULL,1,'container8',1),(19,'container10','H:\\fff\\20190314-LPR-brazil\\container\\engine\\Videos Forte\\Video_1 (10).mp4',NULL,1,'container10',1),(20,'container11','H:\\fff\\20190314-LPR-brazil\\container\\engine\\Videos Forte\\Video_1 (11).mp4',NULL,1,'container11',1),(22,'stef1','rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',NULL,1,'pari',14),(23,'stef2','rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',NULL,1,'pari',14),(24,'stef3','rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',NULL,1,'pari',14),(25,'stef4','rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',NULL,1,'pari',14),(26,'stef5','rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',NULL,1,'pari',14),(27,'stef6','rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',NULL,1,'pari',14),(28,'stef7','rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',NULL,1,'pari',14),(29,'stef8','rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',NULL,1,'pari',14),(30,'stef9','rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',NULL,1,'pari',14),(31,'stef10','rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',NULL,1,'pari',14);

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

insert  into `tbl_admin`(`id`,`name`,`email`,`password`,`register_date`,`icon_path`,`role_id`) values (1,'Pang','pang@gmail.com','123456','2020-07-08 16:55:41',NULL,2),(2,'Aman','aman@gmail.com','123456','2020-09-04 16:59:17','',1),(14,'Aman1','ex@gmail.com','12345','2020-12-04 00:00:00',NULL,6),(19,'good','good@gmail.com','good','2021-02-10 00:00:00',NULL,6),(20,'test','test@outlook.com','test123','2021-02-10 00:00:00',NULL,2);

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
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8;

/*Data for the table `videos` */

insert  into `videos`(`id`,`video_filename`,`camera_id`,`thumb_name`,`start_time`,`end_time`) values (5,'/static/video/IUFAS/2021.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-17_15-33-22.jpg','2020-10-17 07:33:00','2020-10-17 07:35:19'),(6,'/static/video/IUFAS/2021.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-17_15-36-19.jpg','2020-10-17 07:36:19','2020-10-17 07:38:38'),(7,'/static/video/IUFAS/6_2020-10-17_15-36-38.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-17_15-36-38.jpg','2020-10-17 08:36:38','2020-10-17 09:36:42'),(8,'/static/video/IUFAS/6_2020-10-17_15-38-02.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-17_15-38-02.jpg','2020-10-17 08:38:02','2020-10-17 15:38:05'),(9,'/static/video/IUFAS/6_2020-10-17_15-38-18.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-17_15-38-18.jpg','2020-10-17 08:38:18','2020-10-17 15:38:21'),(10,'/static/video/HCTGL/4_2020-10-19_21-15-30.mp4',0,'/static/video/HCTGL/thumbs/4_2020-10-19_21-15-30.jpg','2020-10-19 13:15:30','2020-10-19 21:15:43'),(11,'/static/video/HCTGL/4_2020-10-19_21-20-27.mp4',0,'/static/video/HCTGL/thumbs/4_2020-10-19_21-20-27.jpg','2020-10-19 13:20:27','2020-10-19 21:20:30'),(12,'/static/video/HCTGL/4_2020-10-19_21-23-22.mp4',0,'/static/video/HCTGL/thumbs/4_2020-10-19_21-23-22.jpg','2020-10-19 13:23:22','2020-10-19 21:24:04'),(13,'/static/video/IUFAS/6_2020-10-19_21-26-50.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-19_21-26-50.jpg','2020-10-19 13:26:50','2020-10-19 21:26:58'),(14,'/static/video/HCTGL/4_2020-10-19_21-26-49.mp4',0,'/static/video/HCTGL/thumbs/4_2020-10-19_21-26-49.jpg','2020-10-19 13:26:49','2020-10-19 21:27:01'),(15,'/static/video/HCTGL/4_2020-10-19_21-28-57.mp4',0,'/static/video/HCTGL/thumbs/4_2020-10-19_21-28-57.jpg','2020-10-19 13:28:57','2020-10-19 21:29:06'),(16,'/static/video/IUFAS/6_2020-10-19_21-29-52.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-19_21-29-52.jpg','2020-10-19 13:29:52','2020-10-19 21:30:03'),(17,'/static/video/IUFAS/6_2020-10-19_21-30-04.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-19_21-30-04.jpg','2020-10-19 13:30:04','2020-10-19 21:30:15'),(18,'/static/video/IUFAS/6_2020-10-20_00-04-29.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-20_00-04-29.jpg','2020-10-19 16:04:29','2020-10-20 00:04:40'),(19,'/static/video/IUFAS/6_2020-10-20_00-04-59.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-20_00-04-59.jpg','2020-10-19 16:04:59','2020-10-20 00:05:09'),(20,'/static/video/IUFAS/6_2020-10-20_00-05-21.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-20_00-05-21.jpg','2020-10-19 16:05:21','2020-10-20 00:05:28'),(21,'/static/video/IUFAS/6_2020-10-20_00-06-13.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-20_00-06-13.jpg','2020-10-19 16:06:13','2020-10-20 00:06:22'),(22,'/static/video/IUFAS/6_2020-10-20_00-06-32.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-20_00-06-32.jpg','2020-10-19 16:06:32','2020-10-20 00:06:39'),(23,'/static/video/IUFAS/6_2020-10-20_00-06-45.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-20_00-06-45.jpg','2020-10-19 16:06:45','2020-10-20 00:06:55'),(24,'/static/video/HCTGL/4_2020-10-20_00-06-54.mp4',0,'/static/video/HCTGL/thumbs/4_2020-10-20_00-06-54.jpg','2020-10-19 16:06:54','2020-10-20 00:07:06'),(25,'/static/video/IUFAS/6_2020-10-20_00-06-59.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-20_00-06-59.jpg','2020-10-19 16:06:59','2020-10-20 00:07:19'),(26,'/static/video/HCTGL/4_2020-10-20_00-07-24.mp4',0,'/static/video/HCTGL/thumbs/4_2020-10-20_00-07-24.jpg','2020-10-19 16:07:24','2020-10-20 00:07:37'),(27,'/static/video/IUFAS/6_2020-10-20_00-08-38.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-20_00-08-38.jpg','2020-10-19 16:08:38','2020-10-20 00:08:51'),(28,'/static/video/IUFAS/6_2020-10-20_00-08-53.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-20_00-08-53.jpg','2020-10-19 16:08:53','2020-10-20 00:09:12'),(29,'/static/video/IUFAS/6_2020-10-20_00-09-43.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-20_00-09-43.jpg','2020-10-19 16:09:43','2020-10-20 00:10:24'),(30,'/static/video/IUFAS/6_2020-10-20_00-10-35.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-20_00-10-35.jpg','2020-10-19 16:10:35','2020-10-20 00:10:45'),(31,'/static/video/IUFAS/6_2020-10-20_00-10-47.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-20_00-10-47.jpg','2020-10-19 16:10:47','2020-10-20 00:11:10'),(34,'/static/video/IUFAS/6_2020-10-20_00-13-20.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-20_00-13-20.jpg','2020-10-19 16:13:20','2020-10-20 00:13:27'),(35,'/static/video/IUFAS/6_2020-10-20_00-17-03.mp4',0,'/static/video/IUFAS/thumbs/6_2020-10-20_00-17-03.jpg','2020-10-19 16:17:03','2020-10-20 00:17:53'),(36,'/static/video/UCOXK/7_2021-03-18_22-10-33.mp4',0,'/static/video/UCOXK/thumbs/7_2021-03-18_22-10-33.jpg','2021-03-18 22:10:33','2021-03-18 22:11:02'),(37,'/static/video/BUQLQ/7_2021-03-23_11-08-24.mp4',0,'/static/video/BUQLQ/thumbs/7_2021-03-23_11-08-24.jpg','2021-03-23 11:08:24','2021-03-23 11:09:30'),(38,'/static/video/BUQLQ/7_2021-03-23_11-10-10.mp4',0,'/static/video/BUQLQ/thumbs/7_2021-03-23_11-10-10.jpg','2021-03-23 11:10:10','2021-03-23 11:10:24'),(39,'/static/video/BUQLQ/7_2021-03-23_11-11-03.mp4',0,'/static/video/BUQLQ/thumbs/7_2021-03-23_11-11-03.jpg','2021-03-23 11:11:03','2021-03-23 11:11:17'),(40,'/static/video/BUQLQ/7_2021-03-23_11-11-38.mp4',0,'/static/video/BUQLQ/thumbs/7_2021-03-23_11-11-38.jpg','2021-03-23 11:11:38','2021-03-23 11:11:46'),(41,'/static/video/BUQLQ/7_2021-03-23_11-18-08.mp4',0,'/static/video/BUQLQ/thumbs/7_2021-03-23_11-18-08.jpg','2021-03-23 11:18:08','2021-03-23 11:18:17'),(42,'/static/video/BUQLQ/7_2021-03-23_11-28-12.mp4',0,'/static/video/BUQLQ/thumbs/7_2021-03-23_11-28-12.jpg','2021-03-23 11:28:12','2021-03-23 11:28:25'),(43,'/static/video/BUQLQ/7_2021-03-23_12-01-18.mp4',0,'/static/video/BUQLQ/thumbs/7_2021-03-23_12-01-18.jpg','2021-03-23 12:01:18','2021-03-23 12:01:36'),(44,'/static/video/BUQLQ/7_2021-03-23_13-30-56.mp4',0,'/static/video/BUQLQ/thumbs/7_2021-03-23_13-30-56.jpg','2021-03-23 13:30:56','2021-03-23 13:31:56'),(45,'/static/video/BUQLQ/7_2021-03-23_13-56-38.mp4',0,'/static/video/BUQLQ/thumbs/7_2021-03-23_13-56-38.jpg','2021-03-23 13:56:38','2021-03-23 13:56:50'),(46,'/static/video/BUQLQ/7_2021-03-23_13-56-51.mp4',0,'/static/video/BUQLQ/thumbs/7_2021-03-23_13-56-51.jpg','2021-03-23 13:56:51','2021-03-23 13:57:01'),(47,'/static/video/BUQLQ/7_2021-03-23_13-57-35.mp4',0,'/static/video/BUQLQ/thumbs/7_2021-03-23_13-57-35.jpg','2021-03-23 13:57:35','2021-03-23 13:57:44'),(48,'/static/video/BUQLQ/7_2021-03-23_13-57-58.mp4',0,'/static/video/BUQLQ/thumbs/7_2021-03-23_13-57-58.jpg','2021-03-23 13:57:58','2021-03-23 13:58:21'),(49,'/static/video/BUQLQ/7_2021-03-23_13-58-28.mp4',0,'/static/video/BUQLQ/thumbs/7_2021-03-23_13-58-28.jpg','2021-03-23 13:58:28','2021-03-23 13:58:42'),(50,'/static/video/BUQLQ/7_2021-03-23_13-58-43.mp4',0,'/static/video/BUQLQ/thumbs/7_2021-03-23_13-58-43.jpg','2021-03-23 13:58:43','2021-03-23 13:59:01'),(51,'/static/video/HQGZL/8_2021-03-26_23-24-53.mp4',8,'/static/video/HQGZL/thumbs/8_2021-03-26_23-24-53.jpg','2021-03-26 23:24:53','2021-03-26 23:24:55'),(52,'/static/video/TXJSA/3_2021-04-17_15-38-28.mp4',3,'/static/video/TXJSA/thumbs/3_2021-04-17_15-38-28.jpg','2021-04-17 15:38:28','2021-04-17 15:38:38'),(53,'/static/video/TXJSA/3_2021-04-17_19-44-33.mp4',3,'/static/video/TXJSA/thumbs/3_2021-04-17_19-44-33.jpg','2021-04-17 19:44:33','2021-04-17 19:44:43');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
