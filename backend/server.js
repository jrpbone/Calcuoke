import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'calcuoke',
  PORT = '3001'
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

const safeString = (value) => (value === null || value === undefined ? '' : String(value));

const toNullableString = (value) => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str.length ? str : null;
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const normalizeComponent = (input) => ({
  id: safeString(input?.id).trim(),
  name: safeString(input?.name).trim(),
  sku: safeString(input?.sku).trim(),
  category: safeString(input?.category).trim(),
  brand: safeString(input?.brand).trim(),
  price: Number(input?.price) || 0,
  image: input?.image ? String(input.image) : null
});

const normalizeProject = (input) => ({
  id: safeString(input?.id).trim(),
  name: safeString(input?.name).trim(),
  grade: safeString(input?.grade).trim(),
  createdDate: safeString(input?.createdDate).trim(),
  totalCost: Number(input?.totalCost) || 0,
  invoiceNumber: toNullableString(input?.invoiceNumber),
  buyerName: toNullableString(input?.buyerName),
  buyerAddress: toNullableString(input?.buyerAddress),
  dateSold: toNullableString(input?.dateSold),
  components: ensureArray(input?.components),
  originalComponents: Array.isArray(input?.originalComponents) ? input.originalComponents : null,
  photos: Array.isArray(input?.photos) ? input.photos : null,
  swapHistory: Array.isArray(input?.swapHistory) ? input.swapHistory : null
});

const mapComponentRow = (row) => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  category: row.category,
  brand: row.brand,
  price: Number(row.price),
  image: row.image || undefined
});

const mapProjectComponentRow = (row) => ({
  id: row.component_id,
  name: row.name,
  sku: row.sku,
  category: row.category,
  brand: row.brand,
  price: Number(row.price),
  image: row.image || undefined
});

const addToMap = (map, key, value) => {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
};

app.get('/api/status', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (error) {
    res.status(503).json({ ok: false });
  }
});

app.get('/api/components', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, sku, category, brand, price, image FROM components ORDER BY created_at DESC'
    );
    res.json(rows.map(mapComponentRow));
  } catch (error) {
    next(error);
  }
});

app.post('/api/components', async (req, res, next) => {
  try {
    const comp = normalizeComponent(req.body);
    if (!comp.id || !comp.name || !comp.sku || !comp.category || !comp.brand) {
      return res.status(400).json({ error: 'Missing required component fields.' });
    }

    await pool.execute(
      `INSERT INTO components (id, name, sku, category, brand, price, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         sku = VALUES(sku),
         category = VALUES(category),
         brand = VALUES(brand),
         price = VALUES(price),
         image = VALUES(image)`,
      [comp.id, comp.name, comp.sku, comp.category, comp.brand, comp.price, comp.image]
    );

    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.put('/api/components/:id', async (req, res, next) => {
  try {
    const comp = normalizeComponent({ ...req.body, id: req.params.id });
    if (!comp.id || !comp.name || !comp.sku || !comp.category || !comp.brand) {
      return res.status(400).json({ error: 'Missing required component fields.' });
    }

    await pool.execute(
      `INSERT INTO components (id, name, sku, category, brand, price, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         sku = VALUES(sku),
         category = VALUES(category),
         brand = VALUES(brand),
         price = VALUES(price),
         image = VALUES(image)`,
      [comp.id, comp.name, comp.sku, comp.category, comp.brand, comp.price, comp.image]
    );

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/components/:id', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM components WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/projects', async (req, res, next) => {
  try {
    const [projectRows] = await pool.query(
      `SELECT id, name, grade, created_date, total_cost, invoice_number, buyer_name, buyer_address, date_sold
       FROM projects
       ORDER BY created_at DESC`
    );

    if (projectRows.length === 0) {
      return res.json([]);
    }

    const projectIds = projectRows.map((row) => row.id);
    const placeholders = projectIds.map(() => '?').join(',');

    const [componentRows] = await pool.query(
      `SELECT project_id, component_id, name, sku, category, brand, price, image, is_original, sort_order
       FROM project_components
       WHERE project_id IN (${placeholders})
       ORDER BY project_id, is_original, sort_order`,
      projectIds
    );

    const [photoRows] = await pool.query(
      `SELECT project_id, photo, sort_order
       FROM project_photos
       WHERE project_id IN (${placeholders})
       ORDER BY project_id, sort_order`,
      projectIds
    );

    const [swapRows] = await pool.query(
      `SELECT project_id, category, replaced_item_name, replaced_item_sku, new_item_name, new_item_sku,
              swap_date, customer_name, sort_order
       FROM project_swaps
       WHERE project_id IN (${placeholders})
       ORDER BY project_id, sort_order`,
      projectIds
    );

    const componentsByProject = new Map();
    const originalsByProject = new Map();

    componentRows.forEach((row) => {
      const mapped = mapProjectComponentRow(row);
      if (row.is_original) {
        addToMap(originalsByProject, row.project_id, mapped);
      } else {
        addToMap(componentsByProject, row.project_id, mapped);
      }
    });

    const photosByProject = new Map();
    photoRows.forEach((row) => {
      addToMap(photosByProject, row.project_id, row.photo);
    });

    const swapsByProject = new Map();
    swapRows.forEach((row) => {
      addToMap(swapsByProject, row.project_id, {
        category: row.category,
        replacedItemName: row.replaced_item_name,
        replacedItemSku: row.replaced_item_sku,
        newItemName: row.new_item_name,
        newItemSku: row.new_item_sku,
        date: row.swap_date,
        customerName: row.customer_name || undefined
      });
    });

    const payload = projectRows.map((row) => {
      const originals = originalsByProject.get(row.id);
      const photos = photosByProject.get(row.id);
      const swaps = swapsByProject.get(row.id);
      return {
        id: row.id,
        name: row.name,
        grade: row.grade,
        createdDate: row.created_date,
        components: componentsByProject.get(row.id) || [],
        originalComponents: originals && originals.length ? originals : undefined,
        totalCost: Number(row.total_cost),
        invoiceNumber: row.invoice_number ?? undefined,
        buyerName: row.buyer_name ?? undefined,
        buyerAddress: row.buyer_address ?? undefined,
        dateSold: row.date_sold ?? undefined,
        photos: photos && photos.length ? photos : undefined,
        swapHistory: swaps && swaps.length ? swaps : undefined
      };
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

const insertProjectComponents = async (connection, projectId, components, isOriginal) => {
  if (!components.length) return;
  const rows = components.map((item, index) => [
    projectId,
    safeString(item?.id).trim(),
    safeString(item?.name).trim(),
    safeString(item?.sku).trim(),
    safeString(item?.category).trim(),
    safeString(item?.brand).trim(),
    Number(item?.price) || 0,
    item?.image ? String(item.image) : null,
    isOriginal ? 1 : 0,
    index
  ]);

  await connection.query(
    `INSERT INTO project_components
      (project_id, component_id, name, sku, category, brand, price, image, is_original, sort_order)
     VALUES ?`,
    [rows]
  );
};

const insertProjectPhotos = async (connection, projectId, photos) => {
  if (!photos.length) return;
  const rows = photos.map((photo, index) => [projectId, String(photo), index]);
  await connection.query(
    'INSERT INTO project_photos (project_id, photo, sort_order) VALUES ?',
    [rows]
  );
};

const insertProjectSwaps = async (connection, projectId, swaps) => {
  if (!swaps.length) return;
  const rows = swaps.map((swap, index) => [
    projectId,
    safeString(swap?.category).trim(),
    safeString(swap?.replacedItemName).trim(),
    safeString(swap?.replacedItemSku).trim(),
    safeString(swap?.newItemName).trim(),
    safeString(swap?.newItemSku).trim(),
    safeString(swap?.date).trim(),
    toNullableString(swap?.customerName),
    index
  ]);
  await connection.query(
    `INSERT INTO project_swaps
      (project_id, category, replaced_item_name, replaced_item_sku, new_item_name, new_item_sku, swap_date, customer_name, sort_order)
     VALUES ?`,
    [rows]
  );
};

const saveProject = async (req, res, next, statusCode) => {
  const project = normalizeProject(req.body);
  if (!project.id || !project.name || !project.grade || !project.createdDate) {
    return res.status(400).json({ error: 'Missing required project fields.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO projects
        (id, name, grade, created_date, total_cost, invoice_number, buyer_name, buyer_address, date_sold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         grade = VALUES(grade),
         created_date = VALUES(created_date),
         total_cost = VALUES(total_cost),
         invoice_number = VALUES(invoice_number),
         buyer_name = VALUES(buyer_name),
         buyer_address = VALUES(buyer_address),
         date_sold = VALUES(date_sold)`,
      [
        project.id,
        project.name,
        project.grade,
        project.createdDate,
        project.totalCost,
        project.invoiceNumber,
        project.buyerName,
        project.buyerAddress,
        project.dateSold
      ]
    );

    await connection.execute(
      'DELETE FROM project_components WHERE project_id = ? AND is_original = 0',
      [project.id]
    );
    await insertProjectComponents(connection, project.id, project.components, false);

    if (project.originalComponents !== null) {
      await connection.execute(
        'DELETE FROM project_components WHERE project_id = ? AND is_original = 1',
        [project.id]
      );
      await insertProjectComponents(connection, project.id, project.originalComponents, true);
    }

    if (project.photos !== null) {
      await connection.execute('DELETE FROM project_photos WHERE project_id = ?', [project.id]);
      await insertProjectPhotos(connection, project.id, project.photos);
    }

    if (project.swapHistory !== null) {
      await connection.execute('DELETE FROM project_swaps WHERE project_id = ?', [project.id]);
      await insertProjectSwaps(connection, project.id, project.swapHistory);
    }

    await connection.commit();
    res.status(statusCode).json({ ok: true });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

app.post('/api/projects', async (req, res, next) => {
  await saveProject(req, res, next, 201);
});

app.put('/api/projects/:id', async (req, res, next) => {
  req.body = { ...req.body, id: req.params.id };
  await saveProject(req, res, next, 200);
});

app.delete('/api/projects/:id', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error('API error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(Number(PORT), () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
