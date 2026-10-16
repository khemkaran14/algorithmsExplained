# Stateless return packets need an independent matching rule; stateful flow tables differ.
from ipaddress import ip_address, ip_network
def route(routes, destination):
    matches = [r for r in routes if ip_address(destination) in ip_network(r['cidr'])]
    matches.sort(key=lambda r: (-ip_network(r['cidr']).prefixlen, r['priority']))
    return matches[0] if matches else None
def stateless_allowed(rules, direction, peer, port, protocol):
    matches = [r for r in rules if r['direction'] == direction and ip_address(peer) in ip_network(r['cidr'])
               and r['from'] <= port <= r['to'] and r['protocol'] in ('all', protocol)]
    matches.sort(key=lambda r: r['priority'])
    return bool(matches) and matches[0]['action'] == 'allow'
