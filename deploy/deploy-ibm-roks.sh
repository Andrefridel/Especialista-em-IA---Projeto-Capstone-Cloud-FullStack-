#!/bin/bash
# ================================================================
# BookWorm — Deploy Script para IBM ROKS (OpenShift)
# ================================================================
# Pré-requisitos:
#   - ibmcloud CLI instalado
#   - oc CLI instalado  
#   - Docker instalado
#   - Acesso ao IBM Cloud com ROKS cluster
# ================================================================

set -e

# ── Configurações — ALTERE AQUI ──────────────────────────────────
IBM_REGION="us-south"
IBM_RESOURCE_GROUP="Default"
ICR_NAMESPACE="bookworm"
CLUSTER_NAME="bookworm-cluster"
API_IMAGE="us.icr.io/${ICR_NAMESPACE}/bookworm-api:latest"
FRONTEND_IMAGE="us.icr.io/${ICR_NAMESPACE}/bookworm-frontend:latest"

echo "============================================"
echo "  BookWorm — IBM ROKS Deploy"
echo "============================================"

# ── Step 1: Login IBM Cloud ──────────────────────────────────────
echo ""
echo ">>> Step 1: Login IBM Cloud..."
ibmcloud login -r $IBM_REGION -g $IBM_RESOURCE_GROUP --sso

# ── Step 2: Login Container Registry ────────────────────────────
echo ""
echo ">>> Step 2: Login IBM Container Registry..."
ibmcloud cr login
ibmcloud cr namespace-add $ICR_NAMESPACE 2>/dev/null || true

# ── Step 3: Build e Push imagens Docker ─────────────────────────
echo ""
echo ">>> Step 3: Build imagem Backend..."
docker build -t $API_IMAGE ./backend
docker push $API_IMAGE

echo ""
echo ">>> Step 3b: Build imagem Frontend..."
docker build -t $FRONTEND_IMAGE ./frontend
docker push $FRONTEND_IMAGE

# ── Step 4: Conectar ao cluster ROKS ────────────────────────────
echo ""
echo ">>> Step 4: Conectar ao cluster ROKS..."
ibmcloud oc cluster config --cluster $CLUSTER_NAME
oc login --token=$(ibmcloud iam oauth-tokens | grep IAM | awk '{print $3}')

# ── Step 5: Deploy no OpenShift ──────────────────────────────────
echo ""
echo ">>> Step 5: Aplicando manifests..."
oc apply -f deploy/secrets.yaml
oc apply -f deploy/openshift.yaml

# ── Step 6: Aguardar pods subirem ───────────────────────────────
echo ""
echo ">>> Step 6: Aguardando pods iniciarem..."
oc rollout status deployment/bookworm-db -n bookworm
oc rollout status deployment/bookworm-api -n bookworm
oc rollout status deployment/bookworm-frontend -n bookworm

# ── Step 7: Inicializar banco de dados ──────────────────────────
echo ""
echo ">>> Step 7: Inicializando banco de dados..."
DB_POD=$(oc get pods -n bookworm -l app=bookworm-db -o jsonpath='{.items[0].metadata.name}')
oc exec -n bookworm $DB_POD -- psql -U postgres -d bookworm -c "SELECT count(*) FROM books;" 2>/dev/null || \
  oc exec -n bookworm $DB_POD -- psql -U postgres -f /docker-entrypoint-initdb.d/init.sql

# ── Step 8: Exibir URLs ──────────────────────────────────────────
echo ""
echo "============================================"
echo "  Deploy concluido com sucesso!"
echo "============================================"
echo ""
echo "URLs da aplicacao:"
echo "  Frontend: https://$(oc get route bookworm-frontend -n bookworm -o jsonpath='{.spec.host}')"
echo "  API:      https://$(oc get route bookworm-api -n bookworm -o jsonpath='{.spec.host}')"
echo "  Swagger:  https://$(oc get route bookworm-api -n bookworm -o jsonpath='{.spec.host}')/api-docs"
echo ""
