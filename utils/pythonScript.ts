export const PYTHON_SCANNER_SCRIPT = `#!/usr/bin/env python3
"""
Professional Port Scanner with Service Detection
Author: NetSec AI
Purpose: Network security assessment and service discovery
License: MIT

LEGAL NOTICE: Only scan networks you own or have explicit permission to test.
Unauthorized port scanning may be illegal in your jurisdiction.
"""

import socket
import argparse
import sys
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from typing import List, Dict, Tuple

# Common port-to-service mappings
COMMON_PORTS = {
    20: "FTP-Data",
    21: "FTP",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    3306: "MySQL",
    3389: "RDP",
    5432: "PostgreSQL",
    5900: "VNC",
    8080: "HTTP-Proxy",
    8443: "HTTPS-Alt",
    27017: "MongoDB"
}

class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\\033[95m'
    BLUE = '\\033[94m'
    GREEN = '\\033[92m'
    YELLOW = '\\033[93m'
    RED = '\\033[91m'
    END = '\\033[0m'
    BOLD = '\\033[1m'

class PortScanner:
    def __init__(self, target: str, timeout: float = 1.0, verbose: bool = False):
        """
        Initialize the port scanner
        
        Args:
            target: IP address or hostname to scan
            timeout: Socket connection timeout in seconds
            verbose: Enable verbose output
        """
        self.target = target
        self.timeout = timeout
        self.verbose = verbose
        self.open_ports: List[Dict] = []
        
        # Resolve hostname to IP
        try:
            self.target_ip = socket.gethostbyname(target)
        except socket.gaierror:
            raise ValueError(f"Could not resolve hostname: {target}")
    
    def scan_port(self, port: int) -> Tuple[int, bool, str]:
        """
        Scan a single port
        
        Args:
            port: Port number to scan
            
        Returns:
            Tuple of (port, is_open, service_name)
        """
        try:
            # Create socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            
            # Attempt connection
            result = sock.connect_ex((self.target_ip, port))
            sock.close()
            
            if result == 0:
                service = self.detect_service(port)
                if self.verbose:
                    print(f"{Colors.GREEN}[+] Port {port} is OPEN - {service}{Colors.END}")
                return (port, True, service)
            else:
                if self.verbose:
                    print(f"{Colors.RED}[-] Port {port} is CLOSED{Colors.END}")
                return (port, False, "")
                
        except socket.timeout:
            if self.verbose:
                print(f"{Colors.YELLOW}[!] Port {port} timed out{Colors.END}")
            return (port, False, "")
        except Exception as e:
            if self.verbose:
                print(f"{Colors.RED}[!] Error scanning port {port}: {e}{Colors.END}")
            return (port, False, "")
    
    def detect_service(self, port: int) -> str:
        """
        Detect service running on port
        
        Args:
            port: Port number
            
        Returns:
            Service name or "Unknown"
        """
        # Check common ports first
        if port in COMMON_PORTS:
            return COMMON_PORTS[port]
        
        # Try to grab banner for service detection
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.5)
            sock.connect((self.target_ip, port))
            sock.send(b'HEAD / HTTP/1.0\\r\\n\\r\\n')
            banner = sock.recv(1024).decode('utf-8', errors='ignore').strip()
            sock.close()
            
            # Basic banner analysis
            if 'HTTP' in banner:
                return 'HTTP/Web Server'
            elif 'SSH' in banner:
                return 'SSH'
            elif 'FTP' in banner:
                return 'FTP'
            else:
                return f'Unknown ({banner[:20]}...)' if banner else 'Unknown'
        except:
            return 'Unknown'
    
    def scan_ports(self, ports: List[int], max_threads: int = 100) -> List[Dict]:
        """
        Scan multiple ports using threading
        
        Args:
            ports: List of port numbers to scan
            max_threads: Maximum number of concurrent threads
            
        Returns:
            List of dictionaries containing scan results
        """
        print(f"\\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}Starting Port Scanner{Colors.END}")
        print(f"{Colors.BLUE}{'='*60}{Colors.END}")
        print(f"Target: {self.target} ({self.target_ip})")
        print(f"Ports to scan: {len(ports)}")
        print(f"Scan started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{Colors.BLUE}{'='*60}{Colors.END}\\n")
        
        # Use ThreadPoolExecutor for concurrent scanning
        with ThreadPoolExecutor(max_workers=max_threads) as executor:
            # Submit all port scans
            future_to_port = {executor.submit(self.scan_port, port): port for port in ports}
            
            # Process results as they complete
            for future in as_completed(future_to_port):
                port, is_open, service = future.result()
                
                if is_open:
                    self.open_ports.append({
                        'port': port,
                        'service': service,
                        'state': 'open'
                    })
        
        # Sort results by port number
        self.open_ports.sort(key=lambda x: x['port'])
        
        return self.open_ports
    
    def generate_report(self, output_format: str = 'text') -> str:
        """
        Generate scan report
        
        Args:
            output_format: Report format ('text' or 'json')
            
        Returns:
            Formatted report string
        """
        if output_format == 'json':
            report_data = {
                'target': self.target,
                'target_ip': self.target_ip,
                'scan_time': datetime.now().isoformat(),
                'open_ports': self.open_ports,
                'total_open': len(self.open_ports)
            }
            return json.dumps(report_data, indent=2)
        
        # Text format
        report = f"\\n{Colors.BOLD}{Colors.GREEN}{'='*60}{Colors.END}\\n"
        report += f"{Colors.BOLD}Scan Report{Colors.END}\\n"
        report += f"{Colors.GREEN}{'='*60}{Colors.END}\\n"
        report += f"Target: {self.target} ({self.target_ip})\\n"
        report += f"Scan completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\\n"
        report += f"Open ports found: {len(self.open_ports)}\\n"
        report += f"{Colors.GREEN}{'='*60}{Colors.END}\\n\\n"
        
        if self.open_ports:
            report += f"{Colors.BOLD}PORT\\t\\tSTATE\\t\\tSERVICE{Colors.END}\\n"
            report += "-" * 60 + "\\n"
            for port_info in self.open_ports:
                report += f"{port_info['port']}\\t\\t{port_info['state']}\\t\\t{port_info['service']}\\n"
        else:
            report += f"{Colors.YELLOW}No open ports found.{Colors.END}\\n"
        
        # Security recommendations
        report += f"\\n{Colors.BOLD}{Colors.YELLOW}Security Recommendations:{Colors.END}\\n"
        report += "-" * 60 + "\\n"
        
        vulnerable_services = []
        for port_info in self.open_ports:
            port = port_info['port']
            service = port_info['service']
            
            if port in [21, 23]:  # FTP, Telnet
                vulnerable_services.append(f"⚠️  Port {port} ({service}) uses unencrypted communication")
            elif port == 3389:  # RDP
                vulnerable_services.append(f"⚠️  Port {port} ({service}) exposed - ensure strong authentication")
            elif port in [3306, 5432, 27017]:  # Databases
                vulnerable_services.append(f"⚠️  Port {port} ({service}) - database should not be publicly accessible")
        
        if vulnerable_services:
            for warning in vulnerable_services:
                report += f"{warning}\\n"
        else:
            report += f"{Colors.GREEN}✓ No obvious security concerns detected{Colors.END}\\n"
        
        return report

def parse_port_range(port_range: str) -> List[int]:
    """
    Parse port range string into list of ports
    
    Args:
        port_range: Port range string (e.g., "80", "1-100", "80,443,8080")
        
    Returns:
        List of port numbers
    """
    ports = []
    
    for part in port_range.split(','):
        if '-' in part:
            start, end = map(int, part.split('-'))
            ports.extend(range(start, end + 1))
        else:
            ports.append(int(part))
    
    return sorted(set(ports))

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Professional Port Scanner with Service Detection",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=\"\"\"
Examples:
  %(prog)s -t 192.168.1.1                    # Scan common ports
  %(prog)s -t example.com -p 1-1000          # Scan ports 1-1000
  %(prog)s -t 10.0.0.1 -p 80,443,8080        # Scan specific ports
  %(prog)s -t localhost --all                # Scan all 65535 ports
  %(prog)s -t 192.168.1.1 -o report.json     # Save JSON report

LEGAL WARNING: Only scan networks you own or have permission to test.
        \"\"\"
    )
    
    parser.add_argument('-t', '--target', required=True, help='Target IP or hostname')
    parser.add_argument('-p', '--ports', default='', help='Port range (e.g., 1-1000, 80,443)')
    parser.add_argument('--common', action='store_true', help='Scan common ports only (default)')
    parser.add_argument('--all', action='store_true', help='Scan all 65535 ports (slow!)')
    parser.add_argument('--timeout', type=float, default=1.0, help='Connection timeout (default: 1.0s)')
    parser.add_argument('--threads', type=int, default=100, help='Max concurrent threads (default: 100)')
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    parser.add_argument('-o', '--output', help='Output file for report')
    parser.add_argument('--format', choices=['text', 'json'], default='text', help='Report format')
    
    args = parser.parse_args()
    
    # Determine which ports to scan
    if args.all:
        ports = list(range(1, 65536))
        print(f"{Colors.YELLOW}[!] Scanning all 65535 ports - this will take a while!{Colors.END}")
    elif args.ports:
        try:
            ports = parse_port_range(args.ports)
        except ValueError:
            print(f"{Colors.RED}[!] Invalid port range: {args.ports}{Colors.END}")
            sys.exit(1)
    else:
        # Default to common ports
        ports = sorted(COMMON_PORTS.keys())
    
    try:
        # Create scanner and run scan
        scanner = PortScanner(args.target, timeout=args.timeout, verbose=args.verbose)
        scanner.scan_ports(ports, max_threads=args.threads)
        
        # Generate and display report
        report = scanner.generate_report(output_format=args.format)
        print(report)
        
        # Save to file if requested
        if args.output:
            with open(args.output, 'w') as f:
                f.write(report)
            print(f"\\n{Colors.GREEN}[+] Report saved to: {args.output}{Colors.END}")
        
    except ValueError as e:
        print(f"{Colors.RED}[!] Error: {e}{Colors.END}")
        sys.exit(1)
    except KeyboardInterrupt:
        print(f"\\n\\n{Colors.YELLOW}[!] Scan interrupted by user{Colors.END}")
        sys.exit(0)
    except Exception as e:
        print(f"{Colors.RED}[!] Unexpected error: {e}{Colors.END}")
        sys.exit(1)

if __name__ == "__main__":
    main()
`;