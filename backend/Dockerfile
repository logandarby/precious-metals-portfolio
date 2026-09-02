FROM maven:3.9-eclipse-temurin-25 AS dev

WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline -B

COPY docker-entrypoint-dev.sh /usr/local/bin/docker-entrypoint-dev.sh
RUN chmod +x /usr/local/bin/docker-entrypoint-dev.sh

COPY . .

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint-dev.sh"]
