const autoBind = require('auto-bind');
const config = require('../../utils/config/config');

class AlbumsHandler {
    constructor(AlbumsService, SongsService, AlbumsValidator, StorageService, UploadsValidator) {
        this._albumsService = AlbumsService;
        this._songsService = SongsService;
        this._albumsValidator = AlbumsValidator;
        this._storageService = StorageService;
        this._uploadsValidator = UploadsValidator;

        autoBind(this);
    }

    async postAlbumHandler(request, h) {
        this._albumsValidator.validateAlbumsPayload(request.payload);

        const albumId = await this._albumsService.addAlbum(request.payload);

        const response = h.response({
            status: 'success',
            message: 'Album berhasil ditambahkan',
            data: {
                albumId,
            },
        });

        response.code(201);
        return response;
    }

    async getAlbumsHandler() {
        const albums = await this._albumsService.getAlbums();

        return {
            status: 'success',
            data: {
                albums,
            },
        };
    }

    async getAlbumByIdHandler(request) {
        const { id } = request.params;

        const album = await this._albumsService.getAlbumById(id);
        album.songs = await this._songsService.getSongByAlbumId(id);

        return {
            status: 'success',
            data: {
                album,
            },
        };
    }

    async putAlbumByIdHandler(request, h) {
        this._albumsValidator.validateAlbumsPayload(request.payload);

        const { id } = request.params;
        await this._albumsService.editAlbumById(id, request.payload);

        return h.response({
            status: 'success',
            message: 'Album berhasil diperbarui',
        });
    }

    async deleteAlbumByIdHandler(request, h) {
        const { id } = request.params;

        await this._albumsService.deleteAlbumById(id);

        return h.response({
            status: 'success',
            message: 'Album berhasil dihapus',
        });
    }

    async postUploadCoverHandler(request, h) {
        const { id } = request.params;
        const { cover } = request.payload;

        await this._albumsService.checkAlbum(id);

        this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

        const filename = await this._storageService.writeFile(cover, cover.hapi);
        const fileLocation = `http://${config.app.host}:${config.app.port}/albums/covers/${filename}`;

        await this._albumsService.editAlbumToAddCoverById(id, fileLocation);

        const response = h.response({
            status: 'success',
            message: 'Cover berhasil diupload',
        });

        response.code(201);
        return response;
    }

    async postLikesAlbumHandler(request, h) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._albumsService.checkAlbum(id);

        const like = await this._albumsService.addLikeAndDislikeAlbum(id, credentialId);

        return h.response({
            status: 'success',
            message: `Berhasil ${like} Album`,
        }).code(201);
    }

    async getLikesAlbumByIdhandler(request, h) {
        const { id } = request.params;
        const { likes, source } = await this._albumsService.getLikesAlbumById(id);

        const response = h.response({
            status: 'success',
            data: {
                likes,
            },
        });

        response.header('X-Data-Source', source);
        return response;
    }

    async deleteLikesAlbumByIdhandler(request, h) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._albumsService.checkAlbum(id);

        await this._albumsService.unLikeAlbumById(id, credentialId);

        return h.response({
            status: 'success',
            message: 'Album batal disukai',
        }).code(200);
    }
}

module.exports = AlbumsHandler;
