# Stage 1: Build application with Maven
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy Maven POM and source files
COPY pom.xml .
COPY src ./src

# Build production JAR package
RUN mvn clean package -DskipTests

# Stage 2: Lightweight runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port (overridden dynamically by cloud platforms via $PORT)
EXPOSE 8083

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
