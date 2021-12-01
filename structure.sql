-- --------------------------------------------------------
-- Server version:               10.4.8-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             11.0.0.5919
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for table vvarden.guilds
CREATE TABLE IF NOT EXISTS `guilds` (
  `guildid` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
  `guildname` tinytext CHARACTER SET utf8mb4 NOT NULL,
  `logchan` tinytext CHARACTER SET utf8mb4 NOT NULL,
  `punown` varchar(5) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'ban',
  `punsupp` varchar(5) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'kick',
  `punleak` varchar(5) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'kick',
  `puncheat` varchar(5) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'kick',
  `prefix` varchar(50) CHARACTER SET utf8mb4 DEFAULT 'war ',
  PRIMARY KEY (`guildid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table vvarden.users
CREATE TABLE IF NOT EXISTS `users` (
  `userid` varchar(50) NOT NULL,
  `avatar` varchar(150) NOT NULL DEFAULT 'https://discord.com/assets/6debd47ed13483642cf09e832ed0bc1b.png',
  `status` tinytext NOT NULL DEFAULT 'blacklisted',
  `user_type` varchar(50) NOT NULL DEFAULT 'leaker',
  `last_username` tinytext NOT NULL DEFAULT 'unknown#0000',
  `servers` longtext NOT NULL DEFAULT '',
  `roles` longtext NOT NULL DEFAULT '',
  `filter_type` mediumtext NOT NULL DEFAULT 'Semi-Auto',
  `reason` mediumtext NOT NULL DEFAULT 'AUTO: Member of Blacklisted Discord',
  `added_date` tinytext NOT NULL DEFAULT curdate(),
  PRIMARY KEY (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
