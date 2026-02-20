function doGet(e) {
  try {
    const path = (e && e.parameter && e.parameter.path) ? String(e.parameter.path) : '';
    const result = routeGet_(path, e && e.parameter ? e.parameter : {});
    return json_(ok_(result));
  } catch (err) {
    return json_(fail_(err));
  }
}

function doPost(e) {
  try {
    const path = (e && e.parameter && e.parameter.path) ? String(e.parameter.path) : '';
    const bodyText = (e && e.postData && e.postData.contents) ? String(e.postData.contents) : '';
    const body = bodyText ? JSON.parse(bodyText) : {};
    const result = routePost_(path, body);
    return json_(ok_(result));
  } catch (err) {
    return json_(fail_(err));
  }
}

function routeGet_(path, q) {
  switch (path) {
    case 'sections':
      return { sections: listSections_(String(q.type || 'cafe')) };
    case 'items':
      return { items: listItems_(String(q.type || ''), String(q.sectionId || '')) };
    case 'item':
      return { item: getItem_(String(q.id || '')) };
    case 'search':
      return { items: searchItems_(String(q.q || ''), String(q.type || '')) };
    default:
      throw new Error('Unknown GET path');
  }
}

function routePost_(path, body) {
  switch (path) {
    case 'rate':
      return rateItem_(String(body.id || ''), Number(body.value));

    // admin
    case 'admin/login':
      return adminLogin_(String(body.username || ''), String(body.password || ''));
    case 'admin/init':
      return adminInit_(String(body.username || ''), String(body.password || ''));
    case 'admin/upsertItem':
      return adminUpsertItem_(body);
    case 'admin/deleteItem':
      return adminDeleteItem_(String(body.token || ''), String(body.id || ''));
    case 'admin/setDiscount':
      return adminSetDiscount_(String(body.token || ''), String(body.id || ''), Number(body.percent), body.duration || null);
    case 'admin/clearDiscount':
      return adminClearDiscount_(String(body.token || ''), String(body.id || ''));
    case 'admin/listAll':
      return adminListAll_(String(body.token || ''));

    default:
      throw new Error('Unknown POST path');
  }
}

function ok_(data) {
  const out = data || {};
  out.ok = true;
  return out;
}

function fail_(err) {
  return { ok: false, error: (err && err.message) ? String(err.message) : String(err) };
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
