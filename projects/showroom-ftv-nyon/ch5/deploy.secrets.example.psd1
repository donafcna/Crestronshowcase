# Identifiants de deploiement (copier en deploy.secrets.psd1, jamais commite).
# Cles lues par deploy.ps1 : TSW / CP4 { Host, User, Password, HostKeys }, CP4.Slot.
@{
    TSW = @{
        Host     = 'IP_DE_LA_TSW_DU_SHOWROOM'
        User     = 'REMPLACEZ_MOI'
        Password = 'REMPLACEZ_MOI'
        HostKeys = @()            # ex. @('ssh-ed25519 255 SHA256:...') pour plink/pscp non interactifs
    }
    CP4 = @{
        Host     = 'IP_DU_CP4_DU_SHOWROOM'
        User     = 'REMPLACEZ_MOI'
        Password = 'REMPLACEZ_MOI'
        HostKeys = @()
        Slot     = '01'
    }
}
