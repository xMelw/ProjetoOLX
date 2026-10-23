const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('crypto');
const { seedAdditionalDemoData } = require('./demoData');

const dbPath = path.resolve(process.env.DB_PATH || path.join(__dirname, 'data', 'anuncios-tuga.sqlite'));
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);

const run = async (sql, params = []) => {
  const result = db.prepare(sql).run(...params);
  return { id: Number(result.lastInsertRowid), changes: result.changes };
};
const get = async (sql, params = []) => db.prepare(sql).get(...params);
const all = async (sql, params = []) => db.prepare(sql).all(...params);
const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => ({ salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') });

async function seedDemoConversations() {
  const conversations = [
    {
      adTitle: 'iPhone 13 128 GB',
      sellerEmail: 'miguel@example.pt',
      buyerEmail: 'tiago@example.pt',
      messages: [
        ['buyer', 'Olá! Ainda está disponível? Consegue enviar mais fotografias?'],
        ['seller', 'Olá, sim. Está disponível e posso enviar fotografias por aqui.'],
        ['buyer', 'Obrigado! Posso levantar no Porto este fim de semana?'],
        ['seller', 'Pode ser no sábado à tarde. Combinamos a hora por mensagem.']
      ]
    },
    {
      adTitle: 'MacBook Air M1',
      sellerEmail: 'ines@example.pt',
      buyerEmail: 'tiago@example.pt',
      messages: [
        ['buyer', 'Boa tarde. O carregador original está incluído?'],
        ['seller', 'Boa tarde! Sim, segue com o carregador original.'],
        ['buyer', 'Perfeito. Aceita entrega em mão em Coimbra?'],
        ['seller', 'Sim, podemos combinar junto ao centro da cidade.']
      ]
    },
    {
      adTitle: 'Cacto decorativo',
      sellerEmail: 'ines@example.pt',
      buyerEmail: 'miguel@example.pt',
      messages: [
        ['buyer', 'Olá! Qual é aproximadamente a altura do cacto?'],
        ['seller', 'Olá! Tem cerca de 25 cm, incluindo o vaso.']
      ]
    }
  ];

  for (const conversation of conversations) {
    const ad = await get(
      'SELECT a.id FROM ads a JOIN users seller ON seller.id=a.user_id WHERE a.title=? AND seller.email=?',
      [conversation.adTitle, conversation.sellerEmail]
    );
    const buyer = await get('SELECT id FROM users WHERE email=?', [conversation.buyerEmail]);
    const seller = await get('SELECT id FROM users WHERE email=?', [conversation.sellerEmail]);
    if (!ad || !buyer || !seller) continue;

    for (const [sender, body] of conversation.messages) {
      const senderId = sender === 'buyer' ? buyer.id : seller.id;
      const recipientId = sender === 'buyer' ? seller.id : buyer.id;
      const exists = await get(
        'SELECT id FROM messages WHERE ad_id=? AND sender_id=? AND recipient_id=? AND body=?',
        [ad.id, senderId, recipientId, body]
      );
      if (!exists) {
        await run(
          'INSERT INTO messages(ad_id,sender_id,recipient_id,body) VALUES (?,?,?,?)',
          [ad.id, senderId, recipientId, body]
        );
      }
    }
  }
}

async function seedDemoAds() {
  const demoAds = [
    ['Câmara Canon EOS M50','Câmara mirrorless leve, com objetiva 15-45 mm e bateria extra.',420,'placeholder.png',1,'Usado','Tecnologia','miguel@example.pt',68,'ines@example.pt'],
    ['Cadeira ergonómica de escritório','Cadeira ajustável com apoio lombar, em bom estado de conservação.',95,'placeholder.png',1,'Usado','Casa e Jardim','ines@example.pt',54,'tiago@example.pt'],
    ['Bicicleta de estrada em alumínio','Bicicleta revista recentemente, tamanho M, pronta a utilizar.',310,'placeholder.png',1,'Usado','Desporto','tiago@example.pt',41,'miguel@example.pt'],
    ['Guitarra acústica Yamaha','Guitarra acústica bem estimada, inclui saco de transporte.',125,'placeholder.png',1,'Usado','Música','miguel@example.pt',39,'tiago@example.pt'],
    ['Casaco de inverno tamanho M','Casaco quente e impermeável, pouco usado, sem defeitos.',48,'placeholder.png',1,'Usado','Moda','ines@example.pt',36,'miguel@example.pt'],
    ['Mesa de centro em madeira','Mesa de centro restaurada, com acabamento natural e medidas compactas.',75,'placeholder.png',1,'Usado','Casa e Jardim','tiago@example.pt',29,'ines@example.pt']
  ];

  for (const [title, description, price, image, featured, condition, categoryName, sellerEmail, views, favoriteEmail] of demoAds) {
    const seller = await get('SELECT id FROM users WHERE email=?', [sellerEmail]);
    const favoriteUser = await get('SELECT id FROM users WHERE email=?', [favoriteEmail]);
    const category = await get('SELECT id FROM categories WHERE name=?', [categoryName]);
    if (!seller || !category) continue;

    let ad = await get('SELECT id FROM ads WHERE user_id=? AND title=?', [seller.id, title]);
    if (!ad) {
      ad = await run(
        'INSERT INTO ads(user_id,category_id,title,description,price,image,show_contact,featured,condition,status,views) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        [seller.id, category.id, title, description, price, image, 1, featured, condition, 'active', views]
      );
    }
    if (favoriteUser) {
      await run('INSERT OR IGNORE INTO favorites(user_id,ad_id) VALUES (?,?)', [favoriteUser.id, ad.id]);
    }
  }
}

async function initializeDatabase() {
  await run('PRAGMA foreign_keys = ON');
  await run('PRAGMA journal_mode = WAL');
  const schema = [
    `CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY, district TEXT NOT NULL UNIQUE)`,
    `CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, icon TEXT, color TEXT)`,
    `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', location_id INTEGER REFERENCES locations(id), image TEXT, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('active','pending','banned')), role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS ads (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), category_id INTEGER NOT NULL REFERENCES categories(id), title TEXT NOT NULL, description TEXT NOT NULL, price REAL NOT NULL CHECK(price >= 0), image TEXT NOT NULL DEFAULT 'placeholder.png', show_contact INTEGER NOT NULL DEFAULT 1, featured INTEGER NOT NULL DEFAULT 0, condition TEXT NOT NULL DEFAULT 'Usado', status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('active','pending','sold','removed')), views INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS favorites (user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, ad_id INTEGER NOT NULL REFERENCES ads(id) ON DELETE CASCADE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id, ad_id))`,
    `CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, ad_id INTEGER NOT NULL REFERENCES ads(id) ON DELETE CASCADE, sender_id INTEGER NOT NULL REFERENCES users(id), recipient_id INTEGER NOT NULL REFERENCES users(id), body TEXT NOT NULL, is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS recent_views (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, ad_id INTEGER NOT NULL REFERENCES ads(id) ON DELETE CASCADE, viewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, reviewer_id INTEGER NOT NULL REFERENCES users(id), reviewed_user_id INTEGER NOT NULL REFERENCES users(id), rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), review TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','pending','hidden')), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE INDEX IF NOT EXISTS idx_ads_status_created ON ads(status, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_ads_category ON ads(category_id, status)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(ad_id, sender_id, recipient_id, created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_recent_user ON recent_views(user_id, viewed_at DESC)`
  ];
  for (const sql of schema) await run(sql);
  const categoryColumns = await all('PRAGMA table_info(categories)');
  if (!categoryColumns.some((column) => column.name === 'color')) await run("ALTER TABLE categories ADD COLUMN color TEXT NOT NULL DEFAULT '#64748b'");
  await run(`UPDATE categories SET
    icon=CASE name WHEN 'Tecnologia' THEN 'bi bi-phone' WHEN 'Casa e Jardim' THEN 'bi bi-house' WHEN 'Moda' THEN 'bi bi-handbag' WHEN 'Desporto' THEN 'bi bi-bicycle' WHEN 'Veículos' THEN 'bi bi-car-front' WHEN 'Livros' THEN 'bi bi-book' WHEN 'Música' THEN 'bi bi-music-note-beamed' ELSE 'bi bi-box-seam' END,
    color=CASE name WHEN 'Tecnologia' THEN '#2563eb' WHEN 'Casa e Jardim' THEN '#16a34a' WHEN 'Moda' THEN '#db2777' WHEN 'Desporto' THEN '#ea580c' WHEN 'Veículos' THEN '#475569' WHEN 'Livros' THEN '#7c3aed' WHEN 'Música' THEN '#0891b2' ELSE '#64748b' END
    WHERE icon IS NULL OR color IS NULL`);
  const count = await get('SELECT COUNT(*) AS n FROM users');
  if (count.n) {
    await seedDemoAds();
    await seedDemoConversations();
    await seedAdditionalDemoData({ get, run, hashPassword });
    return;
  }

  await run('BEGIN IMMEDIATE TRANSACTION');
  try {
    const districts = ['Aveiro','Beja','Braga','Bragança','Castelo Branco','Coimbra','Évora','Faro','Guarda','Leiria','Lisboa','Portalegre','Porto','Santarém','Setúbal','Viana do Castelo','Vila Real','Viseu','Açores','Madeira'];
    for (const district of districts) await run('INSERT INTO locations(district) VALUES (?)', [district]);
    const categories = [
      ['Tecnologia','bi bi-phone','#2563eb'],['Casa e Jardim','bi bi-house','#16a34a'],
      ['Moda','bi bi-handbag','#db2777'],['Desporto','bi bi-bicycle','#ea580c'],
      ['Veículos','bi bi-car-front','#475569'],['Livros','bi bi-book','#7c3aed'],
      ['Música','bi bi-music-note-beamed','#0891b2'],['Outros','bi bi-box-seam','#64748b']
    ];
    for (const [name,icon,color] of categories) await run('INSERT INTO categories(name,icon,color) VALUES (?,?,?)', [name,icon,color]);
    const demoPassword = 'AnunciosTuga123!';
    const accounts = [
      ['Ana Martins','ana@example.pt','912345678','Lisboa','admin','active'],
      ['Miguel Costa','miguel@example.pt','913456789','Porto','user','active'],
      ['Inês Ferreira','ines@example.pt','914567890','Coimbra','user','active'],
      ['Tiago Santos','tiago@example.pt','915678901','Braga','user','active'],
      ['Carolina Lopes','carolina@example.pt','916789012','Faro','user','pending']
    ];
    const userIds = {};
    for (const [name,email,phone,district,role,status] of accounts) {
      const pwd = hashPassword(demoPassword);
      const result = await run('INSERT INTO users(name,email,phone,location_id,role,status,password_hash,password_salt) VALUES (?,?,?,?,?,?,?,?)', [name,email,phone,(await get('SELECT id FROM locations WHERE district=?',[district])).id,role,status,pwd.hash,pwd.salt]);
      userIds[email] = result.id;
    }
    const ads = [
      ['iPhone 13 128 GB','iPhone 13 em ótimo estado, desbloqueado e com caixa. Bateria a 89%.',389,'iphone.jpg',1,1,'Usado',1,'Tecnologia','miguel@example.pt',220],
      ['MacBook Air M1','Portátil muito estimado, 8 GB RAM e 256 GB SSD. Inclui carregador original.',649,'macbook.jpg',1,1,'Usado',1,'Tecnologia','ines@example.pt',185],
      ['iPad 9.ª geração','iPad Wi-Fi com 64 GB, perfeito para estudo. Ecrã sem riscos.',229,'ipad.jpg',1,0,'Usado',1,'Tecnologia','tiago@example.pt',143],
      ['Apple Watch SE','Apple Watch SE 40 mm, inclui bracelete extra e carregador.',159,'applewatch.jpg',1,0,'Usado',1,'Tecnologia','miguel@example.pt',101],
      ['Cacto decorativo','Cacto saudável em vaso cerâmico. Ideal para oferecer ou decorar.',18,'cacto.jpg',0,0,'Novo',1,'Casa e Jardim','ines@example.pt',76],
      ['Mala de viagem grande','Mala rígida, rodas 360 graus, usada apenas numa viagem.',54,'mala.jpg',1,0,'Usado',1,'Moda','tiago@example.pt',62],
      ['Ténis casuais tamanho 42','Ténis confortáveis, tamanho 42, pouco usados.',32,'sapatos.jpg',1,0,'Usado',1,'Moda','miguel@example.pt',55],
      ['Monitor 24 polegadas','Monitor Full HD com HDMI, adequado para teletrabalho.',95,'placeholder.png',1,0,'Usado',1,'Tecnologia','ines@example.pt',42],
      ['Bicicleta urbana','Bicicleta urbana revista recentemente, mudanças Shimano.',175,'placeholder.png',1,0,'Usado',1,'Desporto','tiago@example.pt',37],
      ['Mesa de apoio em madeira','Mesa pequena restaurada, recolha em Lisboa.',35,'placeholder.png',1,0,'Usado',1,'Casa e Jardim','ines@example.pt',22],
      ['Câmara fotográfica compacta','Câmara digital funcional com bolsa. Anúncio aguarda aprovação.',110,'placeholder.png',1,0,'Usado',0,'Tecnologia','miguel@example.pt',9],
      ['Livro de receitas portuguesas','Livro em muito bom estado. Anúncio vendido.',12,'placeholder.png',0,0,'Usado',2,'Livros','tiago@example.pt',18]
    ];
    for (const [title,description,price,image,contact,featured,condition,status,category,email,views] of ads) {
      const cat = await get('SELECT id FROM categories WHERE name=?',[category]);
      const adStatus = { 0: 'pending', 1: 'active', 2: 'sold' }[status] || 'pending';
      await run('INSERT INTO ads(user_id,category_id,title,description,price,image,show_contact,featured,condition,status,views) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [userIds[email],cat.id,title,description,price,image,contact,featured,condition,adStatus,views]);
    }
    const adRows = await all('SELECT id,user_id FROM ads ORDER BY id');
    await run('INSERT INTO favorites(user_id,ad_id) VALUES (?,?)',[userIds['ines@example.pt'],adRows[0].id]);
    await run('INSERT INTO favorites(user_id,ad_id) VALUES (?,?)',[userIds['tiago@example.pt'],adRows[1].id]);
    await run('INSERT INTO messages(ad_id,sender_id,recipient_id,body,is_read) VALUES (?,?,?,?,?)',[adRows[0].id,userIds['ines@example.pt'],userIds['miguel@example.pt'],'Olá! Ainda está disponível?',0]);
    await run('INSERT INTO messages(ad_id,sender_id,recipient_id,body,is_read) VALUES (?,?,?,?,?)',[adRows[0].id,userIds['miguel@example.pt'],userIds['ines@example.pt'],'Sim, está disponível. Posso combinar entrega em Lisboa.',0]);
    await run('INSERT INTO feedback(reviewer_id,reviewed_user_id,rating,review,status) VALUES (?,?,?,?,?)',[userIds['ines@example.pt'],userIds['miguel@example.pt'],5,'Comunicação rápida e artigo conforme descrito.','active']);
    await run('INSERT INTO feedback(reviewer_id,reviewed_user_id,rating,review,status) VALUES (?,?,?,?,?)',[userIds['tiago@example.pt'],userIds['ines@example.pt'],4,'Negócio simples e simpático.','pending']);
    await seedDemoAds();
    await seedDemoConversations();
    await seedAdditionalDemoData({ get, run, hashPassword });
    await run('COMMIT');
  } catch (error) {
    await run('ROLLBACK');
    throw error;
  }
}

module.exports = { db, run, get, all, initializeDatabase, hashPassword };
