//! Sidra OS Headless Kernel Server Binary Entry Point (Milestone M23)

use sidra_kernel_server::{KernelServer, KernelServerConfig};

fn main() {
    println!("Starting Sidra OS Headless Kernel Server (`sidra-kernel-server` v3.0.0-chambers)...");

    let config = KernelServerConfig::default();
    let timestamp = 1700000000;

    match KernelServer::boot(config, timestamp) {
        Ok(server) => {
            println!(
                "Kernel Server successfully booted in Serving state at endpoint {}",
                server.listener.endpoint_str()
            );
            println!("Kernel Server ready to accept client RPC sessions.");
        }
        Err(err) => {
            eprintln!("Fatal error booting Kernel Server: {}", err);
            std::process::exit(1);
        }
    }
}
