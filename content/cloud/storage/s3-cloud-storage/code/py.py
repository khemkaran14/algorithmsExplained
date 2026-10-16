# Versioning enabled, one key, no lifecycle expiration; historical reads use explicit IDs.
class ObjectVersions:
    def __init__(self, provider): self.provider, self.versions, self.live, self.serial = provider, [], None, 0
    def put(self, value):
        self.serial += 1; self.versions.append((self.serial, value, False)); self.live = self.serial
        return self.serial
    def remove(self):
        if self.provider == 'aws':
            self.serial += 1; self.versions.append((self.serial, None, True)); self.live = self.serial
        else: self.live = None
    def remove_version(self, version):
        was_live = self.live == version
        self.versions = [v for v in self.versions if v[0] != version]
        if was_live: self.live = self.versions[-1][0] if self.provider == 'aws' and self.versions else None
    def get(self):
        v = next((v for v in self.versions if v[0] == self.live), None)
        return None if v is None or v[2] else v[1]
