# Identifiants de deploiement (copier en deploy.secrets.psd1, jamais commite).
# Cles lues par deploy.ps1 : TSW / CP4 { Host, User, Password, HostKeys }, CP4.Slot, CP4.WebAuthToken.
@{
    TSW = @{
        Host     = '192.168.1.16'
        User     = 'REMPLACEZ_MOI'
        Password = 'REMPLACEZ_MOI'
        HostKeys = @()            # ex. @('ssh-ed25519 255 SHA256:...') pour plink/pscp non interactifs
    }
    CP4 = @{
        Host     = '192.168.1.200'
        User     = 'REMPLACEZ_MOI'
        Password = 'REMPLACEZ_MOI'
        HostKeys = @()
        Slot     = '01'
        # WebAuthToken = ''       # jeton du serveur web du CP4, passe dans les QR (?authtoken=)
    }
}
