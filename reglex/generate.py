import json
import sqlite3
from tqdm import tqdm

SAOL_span_hkom = 25
SAOL_span_kt = 31

db_fn = './main.28.se.svenskaakademien.saol.obb'
con = sqlite3.connect(db_fn)
cur = con.cursor()

words = []
cur.execute("SELECT saol.article, saol_wcs.compact, saol_wcs.word AS 'data' FROM saol, saol_wcs WHERE saol.rowid = saol_wcs.docid ORDER BY saol.rowid")

seen_words = set()
categories = []

base_words = {}
for article_id, compact, word in tqdm(cur.fetchall()):
    cur.execute('select data from saol where article=? and code=?', (article_id, SAOL_span_hkom))
    res = cur.fetchall()
    if res:
        t = res[0][0]
        assert t.count('⟨')==1 and t.count('⟩')==1
        t = t.split('⟨')[1].split('⟩')[0]
        cats_text = set(t.split(', '))
        cats_indices = []
        for cat in cats_text:
            if cat not in categories:
                categories.append(cat)
            cats_indices.append(categories.index(cat))
    else:
        cats_indices = []

    extended = True
    if article_id not in seen_words:
        extended = False
        base_words[article_id] = len(words)
        seen_words.add(article_id)
    words.append([compact, word, extended, cats_indices, base_words[article_id]])

with open('words.json', 'w') as f:
    json.dump([words, categories], f, separators=(',',':'))