# SalvaGuadagno Host — app statica servita da nginx
# Pronto per Dokploy: crea un'app di tipo "Dockerfile" puntando a questo repo.
FROM nginx:alpine

COPY index.html avanzato.html /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
