"""Apply OS TLS trust store before any MongoDB/SSL clients are created."""
import truststore

truststore.inject_into_ssl()
