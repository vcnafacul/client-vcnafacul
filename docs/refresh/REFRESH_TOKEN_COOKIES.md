# 🔐 Refresh Token com Cookies HttpOnly

## ✅ Status: IMPLEMENTADO

O sistema de refresh token agora utiliza **cookies httpOnly** para maior segurança contra ataques XSS.

---

## 🎯 O Que Mudou?

### Antes (Inseguro)
```json
// Login retornava
{
  "access_token": "...",
  "refresh_token": "...",  // ❌ Exposto no JSON
  "expires_in": 900
}

// Cliente armazenava manualmente
localStorage.setItem('refresh_token', response.refresh_token);
```

### Agora (Seguro) ✅
```json
// Login retorna
{
  "access_token": "...",
  "expires_in": 900
}
// + Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict

// Navegador gerencia automaticamente
// Não precisa armazenar manualmente!
```

---

## 🔒 Benefícios de Segurança

| Vulnerabilidade | Antes | Agora |
|----------------|-------|-------|
| **XSS** (Cross-Site Scripting) | ❌ Vulnerável | ✅ Protegido (httpOnly) |
| **CSRF** (Cross-Site Request Forgery) | ❌ Vulnerável | ✅ Protegido (SameSite) |
| **Vazamento de Token** | ❌ Alto risco | ✅ Baixo risco |

### Por Que É Mais Seguro?

1. **httpOnly**: JavaScript não consegue acessar o cookie
   - Mesmo com XSS, o atacante não rouba o refresh token
   
2. **Secure**: Cookie só é enviado via HTTPS em produção
   - Protege contra man-in-the-middle

3. **SameSite=Strict**: Cookie só é enviado em requisições do mesmo domínio
   - Protege contra CSRF

---

## 🚀 Como Usar

### 1. **Login**

**Requisição:**
```bash
POST /user/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
HTTP/1.1 200 OK
Set-Cookie: refresh_token=550e8400-e29b-41d4-a716-446655440000; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900
}
```

✅ **O refresh token NÃO aparece mais no body** - está seguro no cookie!

---

### 2. **Renovar Access Token**

**Requisição:**
```bash
POST /user/refresh
Cookie: refresh_token=550e8400-e29b-41d4-a716-446655440000
```

**Resposta:**
```json
HTTP/1.1 200 OK
Set-Cookie: refresh_token=660f9500-f39c-52e5-b827-557766551111; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900
}
```

✅ **Novo refresh token é setado automaticamente no cookie**

---

### 3. **Logout**

**Requisição:**
```bash
POST /user/logout
Cookie: refresh_token=550e8400-e29b-41d4-a716-446655440000
```

**Resposta:**
```json
HTTP/1.1 200 OK
Set-Cookie: refresh_token=; Max-Age=0

{
  "message": "Logout realizado com sucesso"
}
```

✅ **Cookie é limpo automaticamente**

---

## 💻 Integração Frontend

### **Axios (React, Vue, etc.)**

```typescript
import axios from 'axios';

// Configurar axios para enviar cookies
const api = axios.create({
  baseURL: 'http://localhost:3333',
  withCredentials: true,  // ✅ ESSENCIAL - envia cookies automaticamente
});

// Login
const login = async (email: string, password: string) => {
  const response = await api.post('/user/login', { email, password });
  
  // Armazenar apenas o access_token
  localStorage.setItem('access_token', response.data.access_token);
  
  // refresh_token está no cookie (automático)
};

// Interceptor para renovar token automaticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se receber 401 e não for refresh endpoint
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tenta renovar (refresh_token vai automaticamente no cookie)
        const response = await api.post('/user/refresh');

        // Atualiza access_token
        localStorage.setItem('access_token', response.data.access_token);
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token expirado - redirecionar para login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Logout
const logout = async () => {
  await api.post('/user/logout');
  localStorage.clear();
  // Cookie é limpo automaticamente pelo servidor
};
```

---

### **Fetch API (Vanilla JS)**

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:3333/user/login', {
    method: 'POST',
    credentials: 'include',  // ✅ ESSENCIAL
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
};

// Refresh
const refreshToken = async () => {
  const response = await fetch('http://localhost:3333/user/refresh', {
    method: 'POST',
    credentials: 'include',  // ✅ ESSENCIAL
  });

  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
};

// Logout
const logout = async () => {
  await fetch('http://localhost:3333/user/logout', {
    method: 'POST',
    credentials: 'include',  // ✅ ESSENCIAL
  });
  localStorage.clear();
};
```

---

### **React Native / Mobile**

Para aplicativos nativos, você tem duas opções:

#### Opção 1: WebView com Cookies
```javascript
import { WebView } from 'react-native-webview';

// WebView gerencia cookies automaticamente
<WebView 
  source={{ uri: 'https://api.vcnafacul.com.br/user/login' }}
  sharedCookiesEnabled={true}
/>
```

#### Opção 2: Fallback para Body (Compatibilidade Temporária)
```javascript
// A API ainda aceita refresh_token no body como fallback
const refresh = async (refreshToken) => {
  const response = await fetch('http://localhost:3333/user/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  
  return await response.json();
};
```

---

## 🔧 Configuração de Ambiente

### Desenvolvimento (HTTP)
```env
NODE_ENV=development
```
- Cookie **não** usa flag `Secure` (aceita HTTP)
- CORS permite `credentials: true` de qualquer origem

### Produção (HTTPS)
```env
NODE_ENV=production
```
- Cookie usa flag `Secure` (apenas HTTPS)
- CORS restrito aos domínios configurados

---

## 🧪 Testando

### Com cURL

```bash
# 1. Login (salva cookies automaticamente)
curl -X POST http://localhost:3333/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"suasenha"}' \
  -c cookies.txt

# 2. Refresh (usa cookies salvos)
curl -X POST http://localhost:3333/user/refresh \
  -b cookies.txt \
  -c cookies.txt

# 3. Logout (limpa cookies)
curl -X POST http://localhost:3333/user/logout \
  -b cookies.txt
```

### Com Postman

1. **Login**: Faça o POST em `/user/login`
2. **Ver Cookie**: Postman salva automaticamente em `Cookies` tab
3. **Refresh**: Cookie é enviado automaticamente
4. **Logout**: Cookie é limpo automaticamente

---

## 🔄 Retrocompatibilidade

A implementação atual **ainda aceita** `refresh_token` no body como fallback:

```bash
# Ainda funciona (mas não é recomendado)
POST /user/refresh
{
  "refresh_token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Prioridade:**
1. Cookie `refresh_token` (recomendado)
2. Body `refresh_token` (fallback)

Isso permite migração gradual dos clientes.

---

## ⚠️ Considerações Importantes

### 1. **Domínio Único**
Cookies são vinculados ao domínio. Se você tem:
- API: `api.vcnafacul.com.br`
- Frontend: `vcnafacul.com.br`

Configure o cookie com `domain: '.vcnafacul.com.br'` (note o ponto inicial).

### 2. **HTTPS em Produção**
Em produção, **SEMPRE use HTTPS**. Caso contrário, o cookie com `Secure` não será enviado.

### 3. **CORS**
O backend já está configurado com `credentials: true`. Certifique-se de que o frontend também use:
- Axios: `withCredentials: true`
- Fetch: `credentials: 'include'`

### 4. **Subdomínios**
Se precisar compartilhar cookies entre subdomínios, ajuste no controller:

```typescript
res.cookie('refresh_token', tokens.refresh_token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  domain: '.vcnafacul.com.br',  // ✅ Compartilha entre subdomínios
});
```

---

## 📊 Resumo de Mudanças

| Componente | Status | Descrição |
|-----------|--------|-----------|
| **Cookie Parser** | ✅ Instalado | Middleware para parsing de cookies |
| **CORS** | ✅ Configurado | `credentials: true` habilitado |
| **Controller** | ✅ Atualizado | Login, refresh e logout usam cookies |
| **DTOs** | ✅ Atualizado | `refresh_token` agora opcional no body |
| **Segurança** | ✅ Melhorada | httpOnly + Secure + SameSite |

---

## 🎉 Conclusão

O refresh token agora é gerenciado via cookies httpOnly, oferecendo:

✅ **Maior segurança** contra XSS e CSRF  
✅ **Melhor experiência** do desenvolvedor (automático)  
✅ **Compatibilidade** mantida durante transição  
✅ **Zero breaking changes** para quem usar cookies  

Para dúvidas ou problemas, consulte a documentação do NestJS sobre [Cookies](https://docs.nestjs.com/techniques/cookies).

