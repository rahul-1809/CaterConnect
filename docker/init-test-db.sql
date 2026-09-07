-- Docker init script: creates a dedicated test database
CREATE DATABASE caterconnect_test
    WITH OWNER = caterconnect
         ENCODING = 'UTF8'
         LC_COLLATE = 'en_US.utf8'
         LC_CTYPE = 'en_US.utf8'
         TEMPLATE = template0;

GRANT ALL PRIVILEGES ON DATABASE caterconnect_test TO caterconnect;
