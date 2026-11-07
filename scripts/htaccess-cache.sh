#!/bin/sh
# Roda NO SERVIDOR (Hostinger/LiteSpeed), pelo CI, depois do rsync:
#   ssh ... 'sh -s -- <pasta>' < scripts/htaccess-cache.sh
#
# Sem `Cache-Control`, o navegador decide sozinho quanto tempo guardar o
# index.html (~10% da idade dele) e abre a versão antiga depois de um deploy.
# `no-cache` = guarda, mas confere com o servidor (ETag) a cada acesso.
# Os arquivos de `assets/` têm hash no nome e seguem com o cache do servidor.
#
# ⚠️ O .htaccess do servidor já tem a regra de SPA (deep link → index.html):
# não pode ser sobrescrito. Só o bloco entre os marcadores é trocado.
set -eu

ARQ="$1/.htaccess"
INI="# BEGIN vcnafacul-cache"
FIM="# END vcnafacul-cache"

touch "$ARQ"
cp "$ARQ" "$ARQ.bak"
awk -v i="$INI" -v f="$FIM" '$0==i{p=1} !p{print} $0==f{p=0}' "$ARQ.bak" > "$ARQ.tmp"
cat >> "$ARQ.tmp" <<'BLOCO'
# BEGIN vcnafacul-cache
# Gerado pelo CI do client-vcnafacul (scripts/htaccess-cache.sh). Não editar aqui.
<IfModule mod_headers.c>
  <FilesMatch "^(index\.html|sw\.js|manifest\.webmanifest)$">
    Header set Cache-Control "no-cache"
    Header unset Expires
  </FilesMatch>
</IfModule>
# END vcnafacul-cache
BLOCO
mv "$ARQ.tmp" "$ARQ"
