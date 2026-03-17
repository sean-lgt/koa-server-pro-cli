-- ============================================================
-- 数据库初始化脚本
-- 数据库: node-server-db
-- 说明: 先建库，再建表，最后插入示例数据
-- ============================================================

CREATE DATABASE IF NOT EXISTS `node-server-db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `node-server-db`;

-- ------------------------------------------------------------
-- 班级表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Class` (
  `id`   INT          NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_class_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 科目表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Subject` (
  `id`   INT         NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_subject_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 教师表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Teacher` (
  `id`   INT         NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 学生表（依赖 Class）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Student` (
  `id`      INT         NOT NULL AUTO_INCREMENT,
  `sno`     VARCHAR(20) NOT NULL COMMENT '学号',
  `age`     INT         NOT NULL,
  `gender`  ENUM('MALE','FEMALE') NOT NULL,
  `height`  DOUBLE      NOT NULL COMMENT '身高 cm',
  `classId` INT         NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_sno` (`sno`),
  CONSTRAINT `fk_student_class`
    FOREIGN KEY (`classId`) REFERENCES `Class` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 教师 <-> 科目 中间表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `TeacherSubject` (
  `teacherId` INT NOT NULL,
  `subjectId` INT NOT NULL,
  PRIMARY KEY (`teacherId`, `subjectId`),
  CONSTRAINT `fk_ts_teacher`
    FOREIGN KEY (`teacherId`) REFERENCES `Teacher` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_ts_subject`
    FOREIGN KEY (`subjectId`) REFERENCES `Subject` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 教师 <-> 班级 中间表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `TeacherClass` (
  `teacherId` INT NOT NULL,
  `classId`   INT NOT NULL,
  PRIMARY KEY (`teacherId`, `classId`),
  CONSTRAINT `fk_tc_teacher`
    FOREIGN KEY (`teacherId`) REFERENCES `Teacher` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_tc_class`
    FOREIGN KEY (`classId`) REFERENCES `Class` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 示例数据
-- ============================================================

-- 班级
INSERT INTO `Class` (`name`) VALUES
  ('高一(1)班'),
  ('高一(2)班'),
  ('高二(1)班');

-- 科目
INSERT INTO `Subject` (`name`) VALUES
  ('语文'),
  ('数学'),
  ('英语'),
  ('物理'),
  ('化学');

-- 教师
INSERT INTO `Teacher` (`name`) VALUES
  ('张伟'),
  ('李娜'),
  ('王芳');

-- 学生
INSERT INTO `Student` (`sno`, `age`, `gender`, `height`, `classId`) VALUES
  ('2024010001', 16, 'MALE',   175.5, 1),
  ('2024010002', 15, 'FEMALE', 162.0, 1),
  ('2024010003', 16, 'MALE',   180.0, 2),
  ('2024010004', 17, 'FEMALE', 158.5, 3);

-- 教师 <-> 科目
INSERT INTO `TeacherSubject` (`teacherId`, `subjectId`) VALUES
  (1, 1), -- 张伟 -> 语文
  (2, 2), -- 李娜 -> 数学
  (2, 4), -- 李娜 -> 物理
  (3, 3); -- 王芳 -> 英语

-- 教师 <-> 班级
INSERT INTO `TeacherClass` (`teacherId`, `classId`) VALUES
  (1, 1), -- 张伟 -> 高一(1)班
  (1, 2), -- 张伟 -> 高一(2)班
  (2, 1), -- 李娜 -> 高一(1)班
  (2, 3), -- 李娜 -> 高二(1)班
  (3, 2), -- 王芳 -> 高一(2)班
  (3, 3); -- 王芳 -> 高二(1)班
