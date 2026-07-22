BUS.__addEventListener(
    __ON_GAME_LOADED, () => {
        const game = new Game();

        game.start();

        return 1;
    }
);
