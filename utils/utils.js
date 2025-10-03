
function extractPublicId(url) {
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)\.[a-z]+$/i);
    return match ? match[1] : null;
}

module.exports = {
  extractPublicId
};