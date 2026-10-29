async function seedAdditionalDemoData({ get, run, hashPassword }) {
  const demoPassword = 'AnunciosTuga123!';
  const demoUsers = [
    ['Sofia Almeida', 'sofia.demo@example.pt', '917111222', 'Lisboa'],
    ['Rui Carvalho', 'rui.demo@example.pt', '918222333', 'Porto']
  ];

  for (const [name, email, phone, district] of demoUsers) {
    await run('INSERT OR IGNORE INTO locations(district) VALUES (?)', [district]);
    const existing = await get('SELECT id FROM users WHERE email=?', [email]);
    if (!existing) {
      const location = await get('SELECT id FROM locations WHERE district=?', [district]);
      const password = hashPassword(demoPassword);
      await run(
        'INSERT INTO users(name,email,phone,location_id,status,role,password_hash,password_salt) VALUES (?,?,?,?,?,?,?,?)',
        [name, email, phone, location.id, 'active', 'user', password.hash, password.salt]
      );
    }
  }

  const demoAds = [
    { title: 'Máquina de café automática', description: 'Máquina automática revista, com moinho integrado e manutenção em dia.', price: 185, category: 'Tecnologia', seller: 'sofia.demo@example.pt', status: 'active', featured: 1, views: 96, image: 'coffee_machine.jpg' },
    { title: 'Sofá de dois lugares', description: 'Sofá confortável em tecido cinzento. Recolha combinada no Porto.', price: 240, category: 'Casa e Jardim', seller: 'rui.demo@example.pt', status: 'active', featured: 1, views: 83, image: 'sofa.jpg' },
    { title: 'Prancha de surf 7 pés', description: 'Prancha estável para iniciação, com leash e capa incluídos.', price: 160, category: 'Desporto', seller: 'rui.demo@example.pt', status: 'active', featured: 1, views: 71, image: 'surfboard.jpg' },
    { title: 'Comando sem fios para consola', description: 'Comando original testado e a funcionar. Pequenas marcas de uso.', price: 38, category: 'Tecnologia', seller: 'sofia.demo@example.pt', status: 'active', featured: 1, views: 64, image: 'remote_control.jpg' },
    { title: 'Candeeiro de mesa vintage', description: 'Candeeiro restaurado com base metálica e casquilho E27.', price: 42, category: 'Casa e Jardim', seller: 'sofia.demo@example.pt', status: 'pending', featured: 0, views: 7, image: 'vintage_lamp.jpg' },
    { title: 'Impressora doméstica', description: 'Impressora usada, vendida com cabo de alimentação. Anúncio de exemplo vendido.', price: 25, category: 'Tecnologia', seller: 'rui.demo@example.pt', status: 'sold', featured: 0, views: 31, image: 'printer.jpg' },
    { title: 'Bonsai de interior', description: 'Bonsai decorativo em vaso. Anúncio de demonstração removido.', price: 28, category: 'Casa e Jardim', seller: 'sofia.demo@example.pt', status: 'removed', featured: 0, views: 12, image: 'bonsai.jpg' }
  ];

  const adsByTitle = new Map();
  for (const item of demoAds) {
    const seller = await get('SELECT id FROM users WHERE email=?', [item.seller]);
    const category = await get('SELECT id FROM categories WHERE name=?', [item.category]);
    if (!seller || !category) continue;

    let ad = await get('SELECT id FROM ads WHERE user_id=? AND title=?', [seller.id, item.title]);
    if (!ad) {
      ad = await run(
        'INSERT INTO ads(user_id,category_id,title,description,price,image,show_contact,featured,condition,status,views) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        [seller.id, category.id, item.title, item.description, item.price, item.image, 1, item.featured, 'Usado', item.status, item.views]
      );
    }
    adsByTitle.set(item.title, { ...item, id: ad.id });
  }

  const favoriteExamples = [
    ['miguel@example.pt', 'Máquina de café automática'],
    ['ines@example.pt', 'Sofá de dois lugares'],
    ['tiago@example.pt', 'Prancha de surf 7 pés'],
    ['sofia.demo@example.pt', 'Comando sem fios para consola'],
    ['rui.demo@example.pt', 'iPhone 13 128 GB']
  ];
  for (const [email, title] of favoriteExamples) {
    const user = await get('SELECT id FROM users WHERE email=?', [email]);
    const ad = adsByTitle.get(title) || await get('SELECT id FROM ads WHERE title=? ORDER BY id LIMIT 1', [title]);
    if (user && ad) await run('INSERT OR IGNORE INTO favorites(user_id,ad_id) VALUES (?,?)', [user.id, ad.id]);
  }

  const conversationExamples = [
    { title: 'Máquina de café automática', seller: 'sofia.demo@example.pt', buyer: 'miguel@example.pt', messages: [
      ['buyer', 'Olá, a máquina ainda está disponível?', 0],
      ['seller', 'Sim, está disponível e foi revista recentemente.', 1],
      ['buyer', 'Ótimo. Tem os acessórios para limpeza?', 0],
      ['seller', 'Sim, entrego também o kit de limpeza.', 1]
    ] },
    { title: 'Sofá de dois lugares', seller: 'rui.demo@example.pt', buyer: 'ines@example.pt', messages: [
      ['buyer', 'Boa tarde. O sofá tem alguma mancha ou rasgão?', 0],
      ['seller', 'Boa tarde! Está em bom estado, sem rasgões.', 1],
      ['buyer', 'Consegue ajudar no carregamento?', 0],
      ['seller', 'Posso ajudar. Combinamos a recolha para sábado.', 1]
    ] },
    { title: 'Prancha de surf 7 pés', seller: 'rui.demo@example.pt', buyer: 'tiago@example.pt', messages: [
      ['buyer', 'A prancha é adequada para quem está a começar?', 0],
      ['seller', 'Sim, é estável e foi precisamente usada para iniciação.', 1]
    ] }
  ];
  for (const conversation of conversationExamples) {
    const ad = adsByTitle.get(conversation.title);
    const seller = await get('SELECT id FROM users WHERE email=?', [conversation.seller]);
    const buyer = await get('SELECT id FROM users WHERE email=?', [conversation.buyer]);
    if (!ad || !seller || !buyer) continue;
    for (const [senderType, body, isRead] of conversation.messages) {
      const senderId = senderType === 'buyer' ? buyer.id : seller.id;
      const recipientId = senderType === 'buyer' ? seller.id : buyer.id;
      const exists = await get('SELECT id FROM messages WHERE ad_id=? AND sender_id=? AND recipient_id=? AND body=?', [ad.id, senderId, recipientId, body]);
      if (!exists) await run('INSERT INTO messages(ad_id,sender_id,recipient_id,body,is_read) VALUES (?,?,?,?,?)', [ad.id, senderId, recipientId, body, isRead]);
    }
  }

  const feedbackExamples = [
    ['miguel@example.pt', 'sofia.demo@example.pt', 5, 'Comunicação rápida e entrega exatamente como combinado.', 'active'],
    ['sofia.demo@example.pt', 'miguel@example.pt', 5, 'Comprador pontual e muito simpático.', 'active'],
    ['ines@example.pt', 'rui.demo@example.pt', 4, 'Boa comunicação; negócio concluído sem problemas.', 'pending'],
    ['rui.demo@example.pt', 'ines@example.pt', 3, 'Negócio cordial. A avaliação aguarda moderação.', 'hidden'],
    ['tiago@example.pt', 'sofia.demo@example.pt', 4, 'Artigo conforme a descrição e resposta rápida.', 'active']
  ];
  for (const [reviewerEmail, reviewedEmail, rating, review, status] of feedbackExamples) {
    const reviewer = await get('SELECT id FROM users WHERE email=?', [reviewerEmail]);
    const reviewed = await get('SELECT id FROM users WHERE email=?', [reviewedEmail]);
    if (!reviewer || !reviewed) continue;
    const exists = await get('SELECT id FROM feedback WHERE reviewer_id=? AND reviewed_user_id=? AND review=?', [reviewer.id, reviewed.id, review]);
    if (!exists) await run('INSERT INTO feedback(reviewer_id,reviewed_user_id,rating,review,status) VALUES (?,?,?,?,?)', [reviewer.id, reviewed.id, rating, review, status]);
  }

  const viewExamples = [
    ['sofia.demo@example.pt', 'iPhone 13 128 GB'],
    ['rui.demo@example.pt', 'MacBook Air M1'],
    ['miguel@example.pt', 'Sofá de dois lugares'],
    ['ines@example.pt', 'Prancha de surf 7 pés'],
    ['tiago@example.pt', 'Máquina de café automática']
  ];
  for (const [email, title] of viewExamples) {
    const user = await get('SELECT id FROM users WHERE email=?', [email]);
    const ad = adsByTitle.get(title) || await get('SELECT id FROM ads WHERE title=? ORDER BY id LIMIT 1', [title]);
    if (!user || !ad) continue;
    const exists = await get('SELECT id FROM recent_views WHERE user_id=? AND ad_id=?', [user.id, ad.id]);
    if (!exists) await run('INSERT INTO recent_views(user_id,ad_id) VALUES (?,?)', [user.id, ad.id]);
  }
}

module.exports = { seedAdditionalDemoData };
