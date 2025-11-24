# Dashly
Sistema de gerenciamento de dashboards integrado com Power BI e Metabase

## 🚀 Instalação e Configuração Inicial

#### 1. Clone o repositório:
```bash
git clone https://github.com/gabriel-pagani/dashly.git && cd dashly/
```
#### 2. Configure as variáveis de ambiente:
Crie um arquivo .env na raiz do projeto (baseado no [.env.example](https://github.com/gabriel-pagani/dashly/blob/main/.env.example)) e configure as credenciais do banco e do Django.
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
```
Crie também o arquivo local_settings.py na pasta project do backend e configure as credenciais do Metabase e do LDAP.
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
make build-project
```

#### 4. Crie um super usuário (Admin):
Para acessar o sistema pela primeira vez, você precisa criar um super usuário.
```bash
make container-terminal
# Dentro do container:
python manage.py createsuperuser
```

## 🛠️ Comandos de Manutenção
O projeto utiliza um [Makefile](https://github.com/gabriel-pagani/dashly/blob/main/Makefile) para simplificar as operações diárias.

## ⭐ Comandos Úteis
Gerar senhas fortes.
```bash
python3 -c "import string, secrets; print(''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(50)))"
```

# Licença
See the [LICENSE](https://github.com/gabriel-pagani/dashly/blob/main/LICENSE) file for more details.

# Informação para Contato
Email: gabrielpaganidesouza@gmail.com
