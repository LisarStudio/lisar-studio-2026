# Seguridad y Protección del Repositorio

Pasos recomendados para proteger este repo y el sitio en producción:

- Habilitar `Branch protection` en GitHub para `main` (requerir PRs y revisiones, impedir merges directos).
- Exigir `Required reviews` y al menos 1 aprobador de `CODEOWNERS`.
- Activar `Require status checks to pass before merging` y conectar la `CI` (archivo `.github/workflows/ci.yml`).
- Habilitar autenticación de dos factores (2FA) para todas las cuentas con acceso.
- Activar `Dependabot` (ya configurado en `.github/dependabot.yml`) y revisar alertas de seguridad.
- Evitar subir secretos: usar GitHub Secrets y Deploy Keys para despliegues automatizados.
- Habilitar `secret scanning` y `push protection` si está disponible en la cuenta/organización.
- Usar revisiones firmadas (`Require signed commits`) si lo deseas.

Si quieres, puedo abrir los PRs con estos cambios y añadir instrucciones paso a paso para activar las reglas en la interfaz de GitHub.
