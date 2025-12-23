// ./core/handlers/m.bot.js

export default ({ m, sock, cached, message }) => {
    m.bot = m.bot || {}
    m.bot.roles = {}
    m.bot.name = sock.user?.name || '';
    m.bot.id = sock.user?.lid.includes(':') ? (sock.user?.lid.split(":")[0] + "@lid") : sock.user?.lid;
    m.bot.user = '@' + m.bot.id?.split('@')[0] || undefined;
    m.bot.fromMe = message.key.fromMe;

    m.bot.getDesc = async () => await cached.sender.desc(m.bot.id);
    m.bot.getPhoto = async () => await cached.sender.photo(m.bot.id, 'image')
    m.bot.setPhoto = async (image) => await sock.updateProfilePicture(m.bot.id, image)
    m.bot.setDesc = async (desc) => await sock.updateProfileStatus(desc)
    m.bot.setName = async (name) => await sock.updateProfileName(name)
    m.bot.join = async (link) => await sock.groupAcceptInvite(link)
    m.bot.mute = async (id, Boolean, time = 1000 * 60 * 60 * 8) => {
        if (Boolean) await sock.chatModify({ mute: time }, id, []);
        else await sock.chatModify({ mute: null }, id, []);
    }
    m.bot.block = async (id, Boolean) => {
        if (Boolean) await sock.updateBlockStatus(id, 'block');
        else await sock.updateBlockStatus(id, 'unblock');
    }
    m.bot.role = async (...array) =>
        array.some(role => m.bot.roles[role]);

}