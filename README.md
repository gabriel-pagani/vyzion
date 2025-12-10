# Vyzion
Portal de centralização e permissionamento de dashboards do Power BI e Metabase

## 🚀 Instalação e Configuração Inicial

#### 1. Clone o repositório:
```bash
git clone https://github.com/gabriel-pagani/vyzion.git && cd vyzion/
```
#### 2. Configure as variáveis de ambiente:
Crie um arquivo .env na raiz do projeto (baseado no [.env.example](https://github.com/gabriel-pagani/vyzion/blob/main/_deploy/.env.example)) e configure as credenciais do banco e do Django.
```bash
cp --update=none ./_deploy/.env.example ./_deploy/.env
```
```bash
# Conteúdo do .env após a cópia
SECRET_KEY="CHANGE-ME"
DEBUG="1"  # 1 = True | 0 = False
ALLOWED_HOSTS="CHANGE-ME,CHANGE-ME,CHANGE-ME"
CSRF_TRUSTED_ORIGINS="CHANGE-ME,CHANGE-ME,CHANGE-ME"
POSTGRES_DB="CHANGE-ME"
POSTGRES_USER="CHANGE-ME"
POSTGRES_PASSWORD="CHANGE-ME"
POSTGRES_HOST="database"
POSTGRES_PORT="5432"
DEFAULT_EMAIL="email@example.com"
DOMAIN="domain.com"
```
Crie também o arquivo local_settings.py na pasta [project](https://github.com/gabriel-pagani/vyzion/tree/main/backend/project) e configure as credenciais do Metabase e do LDAP.
```bash
touch backend/project/local_settings.py
```
```bash
# Conteúdo mínimo para o local_settings.py
METABASE_SITE_URL=""
METABASE_SECRET_KEY=""
```

#### 3. Build e Start inicial:
Execute o comando de build para instalar as dependências, compilar o React e subir os containers.
```bash
make build-system
```

#### 4. Configure o SSL:
Após o build, pare o sistema para fazer a devidas alterações.
```
make stop-system
```
Edite as seguintes linhas do arquivo [https.conf](https://github.com/gabriel-pagani/vyzion/blob/main/_deploy/https.conf) com o domínio do seu servidor.
```
server_name ______DOMAIN______;

ssl_certificate /etc/letsencrypt/live/______DOMAIN______/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/______DOMAIN______/privkey.pem;
```
Altere também as seguintes linhas do arquivo [docker-compose.yml](https://github.com/gabriel-pagani/vyzion/blob/main/_deploy/docker-compose.yml) para finalizar.
```
nginx:
    image: nginx:alpine
    container_name: nginx
    ports:
        - "80:80"
        - "443:443"
    volumes:
        - static_volume:/app/static
        - ./https.conf:/etc/nginx/conf.d/default.conf
        - ./certbot/conf:/etc/letsencrypt
        - ./certbot/www:/var/www/certbot
```
Após todas as alterações inicie o sistema novamente.
```
make start-system
```
Para acessar o sistema, use o login abaixo.
```bash
Usuário: admin
Senha: 1234
```

## ⭐ Comandos Úteis
Gerar senhas fortes.
```bash
python3 -c "import string, secrets; print(''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(50)))"
```

# Licença
See the [LICENSE](https://github.com/gabriel-pagani/vyzion/blob/main/LICENSE) file for more details.

# Informação para Contato
Email: gabrielpaganidesouza@gmail.com
