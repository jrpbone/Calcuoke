CREATE DATABASE IF NOT EXISTS calcuoke;
USE calcuoke;

DROP TABLE IF EXISTS project_swaps;
DROP TABLE IF EXISTS project_photos;
DROP TABLE IF EXISTS project_components;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS components;

CREATE TABLE components (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(64) NOT NULL UNIQUE,
  category VARCHAR(64) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  image LONGTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  grade VARCHAR(64) NOT NULL,
  created_date VARCHAR(32) NOT NULL,
  total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  invoice_number VARCHAR(64) NULL,
  buyer_name VARCHAR(255) NULL,
  buyer_address TEXT NULL,
  date_sold VARCHAR(32) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE project_components (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  component_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(64) NOT NULL,
  category VARCHAR(64) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  image LONGTEXT NULL,
  is_original TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_components_project (project_id, is_original, sort_order),
  INDEX idx_project_components_sku (sku),
  CONSTRAINT fk_project_components_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE project_photos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  photo LONGTEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_photos_project (project_id, sort_order),
  CONSTRAINT fk_project_photos_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE project_swaps (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  category VARCHAR(64) NOT NULL,
  replaced_item_name VARCHAR(255) NOT NULL,
  replaced_item_sku VARCHAR(64) NOT NULL,
  new_item_name VARCHAR(255) NOT NULL,
  new_item_sku VARCHAR(64) NOT NULL,
  swap_date VARCHAR(32) NOT NULL,
  customer_name VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_swaps_project (project_id, sort_order),
  CONSTRAINT fk_project_swaps_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
