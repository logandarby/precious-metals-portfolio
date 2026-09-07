#!/usr/bin/env bash
# Compile-on-change for Docker/WSL: DevTools watches target/classes, not source.
# Bind mounts often drop inotify events, so this polls file mtimes instead.
set -euo pipefail

checksum() {
  find src pom.xml -type f \( \
      -name '*.java' -o -name '*.xml' -o -name '*.yml' -o \
      -name '*.yaml' -o -name '*.properties' \
    \) -printf '%p %T@ %s\n' 2>/dev/null | sort | md5sum
}

watch_and_compile() {
  echo "Waiting for the initial Maven compile to finish..."
  until [[ -d target/classes && -n "$(find target/classes -name '*.class' -print -quit 2>/dev/null)" ]]; do
    sleep 2
  done
  # Let spring-boot:run finish its own compile phase before we run Maven again.
  sleep 8

  local last current
  last="$(checksum)"
  echo "Watching src/ for changes (1s poll)."
  while true; do
    sleep 1
    current="$(checksum)"
    if [[ "${current}" != "${last}" ]]; then
      echo ">>> Source change detected — recompiling"
      if mvn -o -DskipTests compile || mvn -DskipTests compile; then
        echo ">>> Compile succeeded — DevTools should restart"
      else
        echo ">>> Compile failed — fix errors to reload"
      fi
      last="$(checksum)"
    fi
  done
}

echo "Starting Spring Boot with source-watch compile + DevTools restart"
watch_and_compile &

exec mvn spring-boot:run \
  -DskipTests \
  -Dspring-boot.run.jvmArguments="-Dspring.devtools.restart.enabled=true -Dspring.devtools.restart.poll-interval=1s -Dspring.devtools.restart.quiet-period=400ms"
