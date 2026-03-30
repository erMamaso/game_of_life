from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Set, Tuple

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GameState(BaseModel):
    cells: list
    grid_width: int
    grid_height: int

@app.post("/next_generation")
def get_next_generation(state: GameState):
    cells = set(tuple(cell) for cell in state.cells)
    next_cells = calculate_next_generation(cells, state.grid_width, state.grid_height)
    return {"cells": [list(cell) for cell in next_cells]}

def calculate_next_generation(cells, grid_width, grid_height):
    # This function should implement the logic to calculate the next generation
    # based on the current state of the cells. For simplicity, we will return
    # an empty set here, but you can implement the actual logic as needed.
    next_cells = set()
    cells_to_check = set()
    for x, y in cells:
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                nx, ny = x+dx, y+dy
                if nx < 0 or ny < 0 or nx >= grid_width or ny >= grid_height:
                    continue
                cells_to_check.add((nx, ny))

    for cell in cells_to_check:
        neighbors = 0
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue
                if (cell[0] + dx, cell[1] + dy) in cells:
                    neighbors += 1
        # Apply Conway's Game of Life rules
        if cell in cells and neighbors in [2, 3]:
            next_cells.add(cell)
        elif cell not in cells and neighbors == 3:
            next_cells.add(cell)
    return next_cells