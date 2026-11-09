# BookWorm API — Test Cases
> Gerado com auxílio do ICA Agent (IBM watsonx) — API Testcase Generator
> Base: swagger.yaml (OpenAPI 3.0)

---

## 1. AUTH — Autenticação

### TC-001: Registro de novo usuário (sucesso)
- **Endpoint:** `POST /api/auth/register`
- **Input:**
  ```json
  { "name": "John Doe", "email": "john@test.com", "password": "pass123" }
  ```
- **Expected:** `201 Created` + `{ token: "...", user: { id, name, email, role } }`
- **Validates:** User created in DB, JWT token returned

### TC-002: Registro com email duplicado
- **Endpoint:** `POST /api/auth/register`
- **Input:** email já existente
- **Expected:** `400 Bad Request` + `{ error: "Email already registered" }`

### TC-003: Login com credenciais válidas
- **Endpoint:** `POST /api/auth/login`
- **Input:** `{ "email": "john@test.com", "password": "pass123" }`
- **Expected:** `200 OK` + `{ token, user }`

### TC-004: Login com senha incorreta
- **Endpoint:** `POST /api/auth/login`
- **Input:** senha errada
- **Expected:** `401 Unauthorized` + `{ error: "Invalid credentials" }`

### TC-005: Login sem campos obrigatórios
- **Endpoint:** `POST /api/auth/login`
- **Input:** `{}`
- **Expected:** `400 Bad Request`

---

## 2. BOOKS — Catálogo de Livros

### TC-006: Listar todos os livros
- **Endpoint:** `GET /api/books`
- **Expected:** `200 OK` + `{ total: 9, books: [...] }`
- **Validates:** Retorna array com todos os livros do seed

### TC-007: Buscar livro por título
- **Endpoint:** `GET /api/books?q=Minimalism`
- **Expected:** `200 OK` + books com "Minimalism" no título
- **Validates:** Filtro de busca funciona

### TC-008: Filtrar por formato Paperback
- **Endpoint:** `GET /api/books?format=Paperback`
- **Expected:** `200 OK` + apenas livros Paperback

### TC-009: Obter livro por ID (existe)
- **Endpoint:** `GET /api/books/7`
- **Expected:** `200 OK` + detalhes do "Joy of Minimalism"

### TC-010: Obter livro por ID (não existe)
- **Endpoint:** `GET /api/books/999`
- **Expected:** `404 Not Found` + `{ error: "Book not found" }`

### TC-011: Obter livros recomendados
- **Endpoint:** `GET /api/books/recommended`
- **Headers:** `Authorization: Bearer <token>`
- **Expected:** `200 OK` + array de livros recomendados

### TC-012: Obter bestsellers
- **Endpoint:** `GET /api/books/bestsellers`
- **Expected:** `200 OK` + livros com `is_bestseller = true`

### TC-013: Obter novos lançamentos
- **Endpoint:** `GET /api/books/new-launches`
- **Expected:** `200 OK` + livros com `is_new_launch = true`

### TC-014: Obter livros relacionados
- **Endpoint:** `GET /api/books/7/related`
- **Expected:** `200 OK` + livros da mesma categoria

---

## 3. CATEGORIES — Categorias

### TC-015: Listar todas as categorias
- **Endpoint:** `GET /api/categories`
- **Expected:** `200 OK` + 20 categorias

### TC-016: Livros por categoria
- **Endpoint:** `GET /api/categories/8/books`
- **Expected:** `200 OK` + livros da categoria Self-help

---

## 4. CART — Carrinho

### TC-017: Adicionar livro ao carrinho
- **Endpoint:** `POST /api/cart`
- **Headers:** `Authorization: Bearer <token>`
- **Input:** `{ "bookId": 7, "quantity": 1 }`
- **Expected:** `200 OK` + `{ message: "Item added to cart" }`

### TC-018: Adicionar ao carrinho sem autenticação
- **Endpoint:** `POST /api/cart`
- **Headers:** sem token
- **Expected:** `401 Unauthorized`

### TC-019: Obter carrinho do usuário
- **Endpoint:** `GET /api/cart`
- **Headers:** `Authorization: Bearer <token>`
- **Expected:** `200 OK` + `{ items: [...], total: 149 }`

### TC-020: Atualizar quantidade do item
- **Endpoint:** `PUT /api/cart/1`
- **Headers:** `Authorization: Bearer <token>`
- **Input:** `{ "quantity": 3 }`
- **Expected:** `200 OK` + `{ message: "Cart updated" }`

### TC-021: Remover item do carrinho
- **Endpoint:** `DELETE /api/cart/1`
- **Headers:** `Authorization: Bearer <token>`
- **Expected:** `200 OK` + `{ message: "Item removed" }`

---

## 5. CHECKOUT — Finalização de Compra

### TC-022: Criar pedido (checkout)
- **Endpoint:** `POST /api/checkout`
- **Headers:** `Authorization: Bearer <token>`
- **Input:**
  ```json
  {
    "address": {
      "firstName": "John", "lastName": "Doe",
      "addressLine": "123 Main St", "city": "Mumbai",
      "pin": "400001", "state": "Maharashtra",
      "country": "India", "phone": "9999999999",
      "email": "john@test.com"
    }
  }
  ```
- **Expected:** `201 Created` + `{ orderId, payableAmount, items }`

### TC-023: Checkout com carrinho vazio
- **Endpoint:** `POST /api/checkout`
- **Headers:** `Authorization: Bearer <token>`
- **Input:** carrinho vazio
- **Expected:** `400 Bad Request` + `{ error: "Cart is empty" }`

### TC-024: Aplicar cupom válido
- **Endpoint:** `POST /api/checkout/apply-coupon`
- **Headers:** `Authorization: Bearer <token>`
- **Input:** `{ "code": "SAVE100" }`
- **Expected:** `200 OK` + `{ discount: 100, isPercent: false }`

### TC-025: Aplicar cupom inválido
- **Endpoint:** `POST /api/checkout/apply-coupon`
- **Input:** `{ "code": "INVALID" }`
- **Expected:** `400 Bad Request` + `{ error: "Invalid or expired coupon" }`

### TC-026: Processar pagamento (Credit Card)
- **Endpoint:** `POST /api/checkout/payment`
- **Headers:** `Authorization: Bearer <token>`
- **Input:**
  ```json
  {
    "orderId": 1, "method": "credit_card",
    "cardNumber": "4111111111111111",
    "nameOnCard": "John Doe",
    "cvv": "123", "expiryDate": "12/2027"
  }
  ```
- **Expected:** `200 OK` + `{ success: true, transactionId, items }`

---

## 6. ORDERS — Pedidos

### TC-027: Listar histórico de pedidos
- **Endpoint:** `GET /api/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Expected:** `200 OK` + array de pedidos com `can_cancel`

### TC-028: Obter pedido por ID
- **Endpoint:** `GET /api/orders/1`
- **Headers:** `Authorization: Bearer <token>`
- **Expected:** `200 OK` + detalhes do pedido com items

### TC-029: Cancelar pedido (dentro de 48h)
- **Endpoint:** `DELETE /api/orders/1`
- **Headers:** `Authorization: Bearer <token>`
- **Expected:** `200 OK` + `{ message: "Order cancelled successfully" }`

### TC-030: Cancelar pedido (após 48h)
- **Endpoint:** `DELETE /api/orders/1` (pedido antigo)
- **Expected:** `400 Bad Request` + `{ error: "Cannot cancel order after 48 hours" }`

---

## 7. USERS — Perfil do Usuário

### TC-031: Obter perfil do usuário
- **Endpoint:** `GET /api/users/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Expected:** `200 OK` + `{ id, name, email, role, gift_points }`

### TC-032: Obter gift points
- **Endpoint:** `GET /api/users/gift-points`
- **Headers:** `Authorization: Bearer <token>`
- **Expected:** `200 OK` + `{ giftPoints: <number> }`

### TC-033: Adicionar endereço
- **Endpoint:** `POST /api/users/addresses`
- **Headers:** `Authorization: Bearer <token>`
- **Input:** objeto de endereço completo
- **Expected:** `201 Created` + endereço criado

### TC-034: Listar endereços salvos
- **Endpoint:** `GET /api/users/addresses`
- **Headers:** `Authorization: Bearer <token>`
- **Expected:** `200 OK` + array de endereços

---

## 8. REVIEWS — Avaliações

### TC-035: Submeter review
- **Endpoint:** `POST /api/books/7/reviews`
- **Headers:** `Authorization: Bearer <token>`
- **Input:** `{ "rating": 5, "comment": "Excellent book!" }`
- **Expected:** `201 Created` + `{ message: "Review submitted" }`

### TC-036: Listar reviews de um livro
- **Endpoint:** `GET /api/books/7/reviews`
- **Expected:** `200 OK` + array de reviews com user_name

### TC-037: Review sem autenticação
- **Endpoint:** `POST /api/books/7/reviews`
- **Headers:** sem token
- **Expected:** `401 Unauthorized`

---

## Resumo

| Categoria | Total TCs | GET | POST | PUT | DELETE |
|-----------|-----------|-----|------|-----|--------|
| Auth | 5 | 0 | 5 | 0 | 0 |
| Books | 9 | 9 | 0 | 0 | 0 |
| Categories | 2 | 2 | 0 | 0 | 0 |
| Cart | 5 | 1 | 1 | 1 | 1 |
| Checkout | 5 | 0 | 5 | 0 | 0 |
| Orders | 4 | 2 | 0 | 0 | 1 |
| Users | 4 | 2 | 1 | 0 | 0 |
| Reviews | 3 | 1 | 2 | 0 | 0 |
| **Total** | **37** | **17** | **14** | **1** | **2** |

---

*Generated with IBM watsonx ICA Agent — API Testcase Generator*
*Based on BookWorm OpenAPI 3.0 Specification (swagger.yaml)*
