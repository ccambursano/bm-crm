-- BM CRM - esquema Azure SQL
-- Ejecutar contra la base creada (ver README para el comando az sql db create)

CREATE TABLE clientes (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  nombre NVARCHAR(200) NOT NULL,
  marca NVARCHAR(20) NOT NULL DEFAULT 'informatica',
  contacto NVARCHAR(200),
  email NVARCHAR(200),
  telefono NVARCHAR(50),
  estado NVARCHAR(20) NOT NULL DEFAULT 'activo',
  notas NVARCHAR(MAX),
  creado DATETIME2 DEFAULT SYSUTCDATETIME()
);

CREATE TABLE pipeline (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  nombre NVARCHAR(200) NOT NULL,
  marca NVARCHAR(20) NOT NULL DEFAULT 'informatica',
  etapa NVARCHAR(20) NOT NULL DEFAULT 'contactado',
  valor DECIMAL(14,2),
  origen NVARCHAR(200),
  notas NVARCHAR(MAX),
  creado DATETIME2 DEFAULT SYSUTCDATETIME()
);

CREATE TABLE cotizaciones (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  cliente NVARCHAR(200) NOT NULL,
  marca NVARCHAR(20) NOT NULL DEFAULT 'informatica',
  descripcion NVARCHAR(MAX),
  monto DECIMAL(14,2),
  estado NVARCHAR(20) NOT NULL DEFAULT 'borrador',
  fecha DATE,
  link NVARCHAR(500),
  creado DATETIME2 DEFAULT SYSUTCDATETIME()
);
